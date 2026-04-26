import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { entityService } from "../../services/entityService";
import { companyProfileService } from "../../services/companyProfileService";
import { CrudConfig, SelectOption } from "../../types";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { FormField } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";

interface CrudPageProps {
  config: CrudConfig;
}

type Row = Record<string, unknown> & { id: number };

export const CrudPage = ({ config }: CrudPageProps) => {
  const isCompanyProfilePage = config.title === "Company Profile";
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [optionMap, setOptionMap] = useState<Record<string, SelectOption[]>>(
    {},
  );

  const visibleFields = useMemo(
    () =>
      config.fields.filter((field) => {
        if (!field.showWhen) {
          return true;
        }
        return field.showWhen.values.includes(
          String(form[field.showWhen.field] ?? ""),
        );
      }),
    [config.fields, form],
  );

  const initialForm = useMemo(
    () =>
      config.fields.reduce<Record<string, string>>((accumulator, field) => {
        accumulator[field.name] =
          field.defaultValue == null ? "" : String(field.defaultValue);
        return accumulator;
      }, {}),
    [config.fields],
  );

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await entityService.list<Row>(config.endpoint, {
        search,
        page,
        limit: 10,
      });
      const normalizedRows = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data as unknown as Row]
          : [];
      setRows(normalizedRows);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (error) {
      const status = (error as AxiosError<{ message?: string }>)?.response
        ?.status;
      if (isCompanyProfilePage) {
        try {
          const publicResponse = await companyProfileService.getPublicProfile();
          const profile = publicResponse.data;
          setRows(profile ? [profile as unknown as Row] : []);
          setMeta((current) => ({
            ...current,
            page: 1,
            total: profile ? 1 : 0,
            totalPages: 1,
          }));
          return;
        } catch {
          // Fall through to the generic error toast below.
        }
        if (status === 403) {
          toast.error(
            "You do not have settings read permission to view company profile.",
          );
          return;
        }
      }
      toast.error(`Failed to load ${config.title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    const sources: Record<
      string,
      { endpoint: string; labelKey: string; valueKey: string }
    > =
      (
        config as CrudConfig & {
          selectSources?: Record<
            string,
            { endpoint: string; labelKey: string; valueKey: string }
          >;
        }
      ).selectSources || {};
    const entries = await Promise.all(
      Object.entries(sources).map(async ([fieldName, source]) => {
        const response = await entityService.options<Record<string, unknown>>(
          source.endpoint,
        );
        const data = response.data || [];
        return [
          fieldName,
          data.map((item) => ({
            label: String(item[source.labelKey] ?? ""),
            value: item[source.valueKey] as string | number,
          })),
        ] as const;
      }),
    );
    setOptionMap(Object.fromEntries(entries));
  };

  useEffect(() => {
    void loadRows();
    void loadOptions();
  }, [search, page]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    const nextForm = config.fields.reduce<Record<string, string>>(
      (accumulator, field) => {
        if (field.optionalOnEdit) {
          accumulator[field.name] = "";
        } else {
          accumulator[field.name] =
            row[field.name] == null ? "" : String(row[field.name]);
        }
        return accumulator;
      },
      {},
    );
    setForm(nextForm);
    setModalOpen(true);
  };

  const handleChange = (name: string, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const getCompanyProfilePersistedForm = () => {
    const currentRow = rows[0];
    if (!currentRow) {
      return {
        ...initialForm,
        isDefault: "true",
        isActive: "true",
      };
    }

    return config.fields.reduce<Record<string, string>>(
      (accumulator, field) => {
        accumulator[field.name] =
          currentRow[field.name] == null
            ? String(field.defaultValue ?? "")
            : String(currentRow[field.name]);
        return accumulator;
      },
      {
        isDefault: "true",
        isActive: "true",
      },
    );
  };

  const handleSubmit = async () => {
    const payload = visibleFields.reduce<Record<string, unknown>>(
      (accumulator, field) => {
        const value = form[field.name];
        if (
          editing &&
          field.optionalOnEdit &&
          String(value ?? "").trim() === ""
        ) {
          return accumulator;
        }
        accumulator[field.name] =
          field.type === "number" ? Number(value) : value;
        return accumulator;
      },
      {},
    );
    try {
      if (editing) {
        const response = await entityService.update<Row>(
          config.endpoint,
          editing.id,
          payload,
        );
        const updatedRow = response.data;
        if (updatedRow) {
          setRows((current) =>
            current.map((row) => (row.id === editing.id ? updatedRow : row)),
          );
        }
        if (config.endpoint === "/company-profiles") {
          window.dispatchEvent(new Event("company-profile-updated"));
        }
        toast.success(`${config.title} updated`);
      } else {
        const response = await entityService.create<Row>(
          config.endpoint,
          payload,
        );
        const createdRow = response.data;
        if (createdRow) {
          setRows((current) =>
            [
              createdRow,
              ...current.filter((row) => row.id !== createdRow.id),
            ].slice(0, meta.limit),
          );
          setMeta((current) => ({
            ...current,
            total: current.total + 1,
            totalPages: Math.max(
              1,
              Math.ceil((current.total + 1) / current.limit),
            ),
          }));
        }
        if (config.endpoint === "/company-profiles") {
          window.dispatchEvent(new Event("company-profile-updated"));
        }
        toast.success(`${config.title} created`);
      }
      setModalOpen(false);
    } catch {
      toast.error(`Unable to save ${config.title.toLowerCase()}`);
    }
  };

  const handleCompanyProfileSubmit = async () => {
    const currentRow = rows[0];
    const payload = config.fields.reduce<Record<string, unknown>>(
      (accumulator, field) => {
        const rawValue = form[field.name] ?? String(field.defaultValue ?? "");
        accumulator[field.name] =
          field.type === "number" ? Number(rawValue) : rawValue;
        return accumulator;
      },
      {},
    );

    payload.isDefault = true;
    payload.isActive = true;

    try {
      if (currentRow) {
        const response = await entityService.update<Row>(
          config.endpoint,
          currentRow.id,
          payload,
        );
        const updatedRow = response.data;
        if (updatedRow) {
          setRows([updatedRow]);
          setForm(getCompanyProfilePersistedForm());
        }
      } else {
        const response = await entityService.create<Row>(
          config.endpoint,
          payload,
        );
        const createdRow = response.data;
        if (createdRow) {
          setRows([createdRow]);
          setForm(
            config.fields.reduce<Record<string, string>>(
              (accumulator, field) => {
                accumulator[field.name] =
                  createdRow[field.name] == null
                    ? String(field.defaultValue ?? "")
                    : String(createdRow[field.name]);
                return accumulator;
              },
              { isDefault: "true", isActive: "true" },
            ),
          );
        }
      }

      window.dispatchEvent(new Event("company-profile-updated"));
      toast.success("Company Profile saved");
    } catch (error) {
      const status = (error as AxiosError<{ message?: string }>)?.response
        ?.status;
      if (status === 403) {
        toast.error(
          "You do not have settings write permission to update company profile.",
        );
        return;
      }
      toast.error("Unable to save company profile");
    }
  };

  const handleCompanyProfileCancel = () => {
    setForm(getCompanyProfilePersistedForm());
  };

  useEffect(() => {
    if (isCompanyProfilePage) {
      setForm(getCompanyProfilePersistedForm());
    }
  }, [isCompanyProfilePage, rows]);

  const handleDelete = async (row: Row) => {
    if (!window.confirm(`Delete ${config.title.toLowerCase()}?`)) {
      return;
    }
    try {
      await entityService.remove(config.endpoint, row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setMeta((current) => {
        const nextTotal = Math.max(0, current.total - 1);
        return {
          ...current,
          total: nextTotal,
          totalPages: Math.max(1, Math.ceil(nextTotal / current.limit)),
        };
      });
      toast.success(`${config.title} deleted`);
    } catch {
      toast.error(`Unable to delete ${config.title.toLowerCase()}`);
    }
  };

  if (isCompanyProfilePage) {
    const companyTitleField = config.fields.find(
      (field) => field.name === "companyTitle",
    );
    const logoField = config.fields.find((field) => field.name === "logoUrl");
    const faviconField = config.fields.find(
      (field) => field.name === "faviconUrl",
    );
    const bannerField = config.fields.find(
      (field) => field.name === "bannerUrl",
    );

    return (
      <div className="space-y-4">
        
        <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.98fr]">
            <div className="space-y-5">
              {companyTitleField ? (
                <div>
                  <label className="mb-2 block text-[15px] font-medium text-slate-800">
                    {companyTitleField.label}
                  </label>
                  <input
                    className="h-[38px] w-full rounded-md border border-[#d1d5db] bg-white px-4 text-[15px] text-slate-900 outline-none"
                    value={form.companyTitle || ""}
                    placeholder={companyTitleField.placeholder}
                    onChange={(event) =>
                      handleChange("companyTitle", event.target.value)
                    }
                  />
                </div>
              ) : null}

              {logoField ? (
                <FormField
                  field={logoField}
                  value={form.logoUrl || ""}
                  onChange={handleChange}
                />
              ) : null}
              {faviconField ? (
                <FormField
                  field={faviconField}
                  value={form.faviconUrl || ""}
                  onChange={handleChange}
                />
              ) : null}

              <div className="flex items-center gap-3 pt-2">
                <button
                  className="rounded-md bg-[#008c45] px-5 py-2.5 text-sm font-semibold text-white"
                  onClick={() => void handleCompanyProfileSubmit()}
                >
                  Save
                </button>
                <button
                  className="rounded-md bg-[#9b0000] px-5 py-2.5 text-sm font-semibold text-white"
                  onClick={handleCompanyProfileCancel}
                >
                  Cancel
                </button>
              </div>
            </div>

            <div>
              {bannerField ? (
                <FormField
                  field={bannerField}
                  value={form.bannerUrl || ""}
                  onChange={handleChange}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full max-w-xl">
            <input
              className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-4 pr-10 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder={config.searchPlaceholder}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-md border border-[#d9e0e4] bg-white px-4 py-2 text-sm font-medium text-slate-700">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {rows.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{meta.total}</span>{" "}
              records
            </div>

            <button
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              onClick={openCreate}
            >
              Add {config.title}
            </button>
          </div>
        </div>
      </div>

      <DataTable
        columns={config.columns}
        rows={rows}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

     <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] px-5 py-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    {/* Previous */}
    <button
      className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:bg-[#f3f4f6] disabled:text-slate-400 disabled:shadow-none"
      disabled={page <= 1}
      onClick={() => setPage((current) => Math.max(current - 1, 1))}
    >
      <span className="text-lg leading-none">‹</span>
      Previous
    </button>

    {/* Page Info */}
    <div className="flex items-center justify-center gap-2">
      <span className="text-sm font-medium text-slate-500">Page</span>

      <span className="inline-flex min-w-[42px] items-center justify-center rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
        {meta.page}
      </span>

      <span className="text-sm font-medium text-slate-500">of</span>

      <span className="inline-flex min-w-[42px] items-center justify-center rounded-md border border-[#d9e0e4] bg-white px-3 py-2 text-sm font-bold text-slate-800">
        {meta.totalPages}
      </span>
    </div>

    {/* Next */}
    <button
      className="inline-flex items-center justify-center gap-2 rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:border-[#e5e7eb] disabled:bg-[#f3f4f6] disabled:text-slate-400 disabled:shadow-none"
      disabled={page >= meta.totalPages}
      onClick={() => setPage((current) => current + 1)}
    >
      Next
      <span className="text-lg leading-none">›</span>
    </button>
  </div>
  <div className="mt-3 text-center text-xs font-medium text-slate-500">
  Showing <span className="font-semibold text-slate-800">{rows.length}</span> of{' '}
  <span className="font-semibold text-slate-800">{meta.total}</span> records
</div>
</div>


    <Modal
  open={modalOpen}
  title={`${editing ? 'Edit' : 'Add'} ${config.title}`}
  onClose={() => setModalOpen(false)}
  footer={
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
      <button
        type="button"
        className="rounded-md border border-[#d1d5db] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        onClick={() => setModalOpen(false)}
      >
        Cancel
      </button>

      <button
        type="button"
        className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        onClick={() => void handleSubmit()}
      >
        Save
      </button>
    </div>
  }
>
  <div className="grid gap-4 md:grid-cols-2">
    {visibleFields.map((field) => (
      <FormField
        key={field.name}
        field={field}
        value={form[field.name] || ''}
        onChange={handleChange}
        options={optionMap[field.name]}
        requiredOverride={
          editing
            ? field.optionalOnEdit
              ? false
              : field.required
            : field.required
        }
      />
    ))}
  </div>
</Modal>
    </div>
  );
};
