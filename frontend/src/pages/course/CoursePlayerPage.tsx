import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';

type Lecture = {
  id: number;
  title: string;
  videoUrl?: string | null;
  completed?: boolean;
};

type CourseModule = {
  id: number;
  title: string;
  duration?: string;
  progress?: string;
  lectures: Lecture[];
};

type CourseDetail = {
  id: number;
  title?: string;
  code?: string;
  enrolledDate?: string;
  completedDate?: string | null;
  status?: string;
  progressPercentage?: number;
  modules?: CourseModule[];
};

type CourseDetailResponse = {
  success: boolean;
  data?: CourseDetail;
  message?: string;
};

type LmsItem = {
  id: number;
  title: string;
  status?: string;
  description?: string;
};

type LmsResponse = {
  success: boolean;
  data?: LmsItem[];
  message?: string;
};

const CoursePlayerPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [activeLectureId, setActiveLectureId] = useState<number | null>(null);

  // LMS sections state
  const [courseContent, setCourseContent] = useState<LmsItem[]>([]);
  const [assignments, setAssignments] = useState<LmsItem[]>([]);
  const [submissions, setSubmissions] = useState<LmsItem[]>([]);
  const [testSeries, setTestSeries] = useState<LmsItem[]>([]);
  const [expandedLmsSection, setExpandedLmsSection] = useState<string | null>(null);
  const [lmsLoading, setLmsLoading] = useState(false);

  const loadCourseDetail = async () => {
    if (!courseId) {
      setErrorMessage('Course id is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.get<CourseDetailResponse>(
        `/training/${courseId}`,
      );

      const courseData = response.data.data;

      if (!courseData) {
        setCourse(null);
        setModules([]);
        setErrorMessage('Course detail not found');
        return;
      }

      const backendModules = courseData.modules ?? [];

      setCourse(courseData);
      setModules(backendModules);

      const firstModule = backendModules[0];
      const firstLecture = firstModule?.lectures?.[0];

      setExpandedModuleId(firstModule?.id ?? null);
      setActiveModuleId(firstModule?.id ?? null);
      setActiveLectureId(firstLecture?.id ?? null);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;

      const responseMessage =
        axiosError.response?.data?.message || axiosError.response?.data?.error;

      setErrorMessage(responseMessage || 'Unable to load course detail');
      toast.error(responseMessage || 'Unable to load course detail');

      setCourse(null);
      setModules([]);

      setExpandedModuleId(null);
      setActiveModuleId(null);
      setActiveLectureId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourseDetail();
  }, [courseId]);

  const loadLmsData = async () => {
    if (!courseId) return;
    
    setLmsLoading(true);
    try {
      const [contentRes, assignmentsRes, submissionsRes, testsRes] = await Promise.allSettled([
        api.get(`/courses/${courseId}/content`),
        api.get(`/assignments?courseId=${courseId}`),
        api.get(`/assignment-submissions?courseId=${courseId}`),
        api.get(`/test-series?courseId=${courseId}`),
      ]);

      if (contentRes.status === 'fulfilled') {
        setCourseContent(contentRes.value.data.data || []);
      }
      if (assignmentsRes.status === 'fulfilled') {
        setAssignments(assignmentsRes.value.data.data || []);
      }
      if (submissionsRes.status === 'fulfilled') {
        setSubmissions(submissionsRes.value.data.data || []);
      }
      if (testsRes.status === 'fulfilled') {
        setTestSeries(testsRes.value.data.data || []);
      }
    } catch (error) {
      // Silently fail for LMS data
    } finally {
      setLmsLoading(false);
    }
  };

  useEffect(() => {
    void loadLmsData();
  }, [courseId]);

  const activeModule = useMemo(
    () => modules.find((module) => module.id === activeModuleId),
    [modules, activeModuleId],
  );

  const activeLecture = useMemo(
    () => activeModule?.lectures.find((lecture) => lecture.id === activeLectureId),
    [activeModule, activeLectureId],
  );

  const courseProgress = Math.min(
    100,
    Math.max(0, Number(course?.progressPercentage || 0)),
  );

  const courseTitle = course?.title || `Course #${courseId || '-'}`;
  const courseCode = course?.code || '-';
  const courseStatus = course?.status || 'Not Started';
  const enrolledDate = course?.enrolledDate || '-';
  const completedDate = course?.completedDate || '-';

  const handleToggleModule = (moduleId: number) => {
    setExpandedModuleId((prev) => (prev === moduleId ? null : moduleId));
  };

  const handleLectureClick = (moduleId: number, lectureId: number) => {
    setExpandedModuleId(moduleId);
    setActiveModuleId(moduleId);
    setActiveLectureId(lectureId);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-white">
        <div className="text-sm font-semibold text-slate-600">
          Loading course detail...
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-70px)] w-full flex flex-col bg-white overflow-visible max-lg:h-auto max-[580px]:pb-[50px]">
      <div className="relative flex flex-col w-full">
        <div className="flex items-center justify-between w-full min-h-[50px] sm:min-h-[60px] md:min-h-[70px] px-2 sm:px-3 md:px-5 bg-[#2d2d2d] rounded-t-lg">
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-7 sm:w-8 md:w-10 aspect-square rounded-md flex items-center justify-center hover:bg-white/10 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <span className="text-xl text-white">‹</span>
            </button>

            <div className="min-w-0">
              <h2 className="text-white text-sm sm:text-base md:text-xl font-semibold leading-[1.23] capitalize tracking-[0.18px] max-w-[120px] sm:max-w-[180px] md:max-w-[420px] truncate">
                {courseTitle}
              </h2>

              <p className="hidden sm:block text-[11px] text-white/75">
                Code: {courseCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-5 justify-end">
            <div className="flex justify-center flex-col w-auto md:w-[188px] h-[36px] sm:h-[42px] md:h-[50px] gap-0.5 sm:gap-1 px-2 sm:px-3 md:px-4 rounded sm:rounded-md md:rounded-lg border border-purple-600/33 bg-[#1401123b]">
              <div className="flex justify-between items-center">
                <p className="text-white hidden md:block text-[12px] font-medium leading-none">
                  Course Progress
                </p>

                <p className="text-white text-[11px] sm:text-[12px] md:text-[14px] font-bold leading-none">
                  {courseProgress}%
                </p>
              </div>

              <div className="w-full hidden md:block h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="mx-2.5 mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex-1 w-full bg-white relative grid grid-cols-[minmax(0,7fr)_minmax(340px,3fr)] overflow-visible p-2.5 box-border gap-2.5 max-lg:flex max-lg:flex-col max-lg:h-auto min-h-0">
        <div className="w-full h-full overflow-y-auto pr-1.5 box-border bg-white">
          <div className="rounded-md overflow-visible">
            <div className="relative w-full">
              <div className="flex flex-col w-full aspect-video mx-auto bg-[#0f0f0f] md:rounded-xl overflow-hidden select-none font-sans">
                {activeLecture?.videoUrl ? (
                  <video
                    key={activeLecture.videoUrl}
                    className="w-full h-full object-contain cursor-pointer"
                    controls
                    playsInline
                    src={activeLecture.videoUrl}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/70">
                    Video not available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2.5 rounded-lg border border-[#e7d4ee] bg-[#fdf8ff] p-3">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-[18px] font-bold text-[#800080]">
                  {courseTitle}
                </h1>

                <p className="text-xs text-slate-500">
                  Selected Course ID: {courseId || course?.id || '-'}
                </p>
              </div>

              <span className="w-fit rounded-full border border-purple-200 bg-white px-3 py-1 text-xs font-semibold text-[#800080]">
                {courseStatus}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg bg-white p-3 ring-1 ring-purple-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Course Code
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {courseCode}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3 ring-1 ring-purple-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Progress
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${courseProgress}%` }}
                    />
                  </div>

                  <span className="text-xs font-bold text-slate-800">
                    {courseProgress}%
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-white p-3 ring-1 ring-purple-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {courseStatus}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3 ring-1 ring-purple-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Enrolled Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {enrolledDate}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3 ring-1 ring-purple-100">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Completed Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {completedDate}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-2.5 bg-[#f7ebfd] mt-2.5 rounded-md md:p-2.5">
            <div>
              <h2 className="text-[#800080] text-[16px] font-[500] sm:text-[20px]">
                Module {activeModule?.id || '-'}.{' '}
                <span className="font-[500] sm:font-semibold">
                  {activeModule?.title || 'Course Module'}
                </span>
              </h2>

              <h3 className="text-black text-[14px] font-[500] md:text-[16px] sm:mt-1">
                {activeLecture?.id || '-'}. {activeLecture?.title || 'Lecture'}
              </h3>
            </div>
          </div>
        </div>

        <aside className="h-full overflow-y-auto max-lg:pb-4">
          <div className="flex w-full flex-col items-center gap-2 mb-5 sm:mb-15 max-[580px]:gap-[7px]">
            <div className="w-full flex p-[17px_12px] flex-col gap-1 rounded-2xl border border-[#eaeaea] bg-white max-[580px]:p-[15px_12px]">
              <div className="flex items-center justify-between cursor-pointer">
                <div className="text-[#5c375c] text-base font-semibold opacity-[0.87]">
                  Course Resources
                </div>
              </div>

              <div className="flex flex-col items-start justify-between gap-3 mt-2.5">
                <div className="w-fit flex items-center gap-2 max-[580px]:gap-1.75">
                  <button className="flex py-2 px-3.5 justify-center items-center rounded-[46px] text-xs font-medium cursor-pointer transition-colors border border-[#8c008c] bg-[rgba(161,5,161,0.07)] text-[#8c008c] hover:bg-[rgba(161,5,161,0.12)]">
                    Notes
                  </button>

                  <button className="flex py-2 px-3.5 justify-center items-center rounded-[46px] text-xs font-medium cursor-pointer transition-colors border border-[#8c008c] bg-[rgba(161,5,161,0.07)] text-[#8c008c] hover:bg-[rgba(161,5,161,0.12)]">
                    Certificate & Refund
                  </button>
                </div>
              </div>
            </div>

            {/* LMS Content Section */}
            <div className="w-full flex p-[12px] flex-col gap-2 rounded-xl border border-[#eaeaea] bg-white">
              <button
                type="button"
                onClick={() => setExpandedLmsSection(expandedLmsSection === 'content' ? null : 'content')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="text-[#5c375c] text-sm font-semibold opacity-[0.87]">📄 Content ({courseContent.length})</div>
                <span className={`text-xs transition-transform ${expandedLmsSection === 'content' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {expandedLmsSection === 'content' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {courseContent.length > 0 ? (
                    courseContent.slice(0, 5).map((item) => (
                      <div key={item.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        {item.status && <div className="text-slate-600">{item.status}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">No content available</div>
                  )}
                </div>
              )}
            </div>

            {/* LMS Assignments Section */}
            <div className="w-full flex p-[12px] flex-col gap-2 rounded-xl border border-[#eaeaea] bg-white">
              <button
                type="button"
                onClick={() => setExpandedLmsSection(expandedLmsSection === 'assignments' ? null : 'assignments')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="text-[#5c375c] text-sm font-semibold opacity-[0.87]">✎ Assignments ({assignments.length})</div>
                <span className={`text-xs transition-transform ${expandedLmsSection === 'assignments' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {expandedLmsSection === 'assignments' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {assignments.length > 0 ? (
                    assignments.slice(0, 5).map((item) => (
                      <div key={item.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        {item.status && <div className="text-slate-600">{item.status}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">No assignments available</div>
                  )}
                </div>
              )}
            </div>

            {/* LMS Submissions Section */}
            <div className="w-full flex p-[12px] flex-col gap-2 rounded-xl border border-[#eaeaea] bg-white">
              <button
                type="button"
                onClick={() => setExpandedLmsSection(expandedLmsSection === 'submissions' ? null : 'submissions')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="text-[#5c375c] text-sm font-semibold opacity-[0.87]">✓ Submissions ({submissions.length})</div>
                <span className={`text-xs transition-transform ${expandedLmsSection === 'submissions' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {expandedLmsSection === 'submissions' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {submissions.length > 0 ? (
                    submissions.slice(0, 5).map((item) => (
                      <div key={item.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        {item.status && <div className="text-slate-600">{item.status}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">No submissions available</div>
                  )}
                </div>
              )}
            </div>

            {/* LMS Test Series Section */}
            <div className="w-full flex p-[12px] flex-col gap-2 rounded-xl border border-[#eaeaea] bg-white">
              <button
                type="button"
                onClick={() => setExpandedLmsSection(expandedLmsSection === 'tests' ? null : 'tests')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="text-[#5c375c] text-sm font-semibold opacity-[0.87]">⚡ Tests ({testSeries.length})</div>
                <span className={`text-xs transition-transform ${expandedLmsSection === 'tests' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {expandedLmsSection === 'tests' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {testSeries.length > 0 ? (
                    testSeries.slice(0, 5).map((item) => (
                      <div key={item.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        {item.status && <div className="text-slate-600">{item.status}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">No tests available</div>
                  )}
                </div>
              )}
            </div>

            {modules.map((module) => {
              const expanded = expandedModuleId === module.id;
              const active = module.id === activeModule?.id;

              return (
                <div
                  key={module.id}
                  className={[
                    'flex flex-col items-start gap-2.5 w-full min-h-[70px] rounded-xl border border-[#eaeaea] max-[580px]:gap-[12.5px]',
                    active ? 'bg-[#fdf8ff]' : 'bg-white',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleModule(module.id)}
                    className={[
                      'w-full flex flex-col cursor-pointer items-start p-[8px_16px] max-[580px]:p-[14px_16px_7px_14px] text-left',
                      active ? 'bg-[#fbeffc] rounded-t-xl' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={[
                          'text-base font-semibold opacity-[0.87] max-w-[calc(100%-30px)] truncate',
                          active ? 'text-[#800080]' : 'text-[#5c375c]',
                        ].join(' ')}
                      >
                        Module {module.id}: {module.title}
                      </span>

                      <span
                        className={[
                          'flex h-6 w-6 items-center justify-center rounded-full border text-xs transition',
                          expanded
                            ? 'rotate-180 border-purple-200 bg-purple-50 text-purple-700'
                            : 'border-slate-200 bg-white text-slate-500',
                        ].join(' ')}
                      >
                        ↓
                      </span>
                    </div>

                    <div className="flex items-center gap-[5px] text-black/60 text-xs max-[580px]:text-[13px]">
                      <span>{module.duration || '-'}</span>
                      <div className="w-px h-[17px] bg-[#555]" />
                      <span>
                        {module.progress ||
                          `${module.lectures.filter((lecture) => lecture.completed).length} / ${module.lectures.length} lectures`}
                      </span>
                    </div>
                  </button>

                  {expanded ? (
                    <div className="p-[0_8px_13px_8px] flex flex-col items-start gap-[13px] flex-1 w-full">
                      {module.lectures.map((lecture, lectureIndex) => {
                        const lectureActive =
                          lecture.id === activeLectureId &&
                          module.id === activeModule?.id;

                        return (
                          <button
                            key={`${module.id}-${lecture.id}`}
                            type="button"
                            onClick={() => handleLectureClick(module.id, lecture.id)}
                            className={[
                              'flex items-center justify-between w-full cursor-pointer group rounded-lg px-2 py-1.5 transition text-left',
                              lectureActive ? 'bg-purple-50' : 'hover:bg-purple-50/60',
                            ].join(' ')}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-purple-200 text-[10px] text-[#992e9d]">
                                ▶
                              </div>

                              <div
                                className={[
                                  'text-[13px] opacity-[0.87] group-hover:text-[#992e9d] transition-colors truncate',
                                  lectureActive
                                    ? 'font-semibold text-[#992e9d]'
                                    : 'font-normal text-[#666]',
                                ].join(' ')}
                              >
                                {lectureIndex + 1}. {lecture.title}
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              className="w-[18px] h-[18px] rounded cursor-pointer accent-[#38A333] shrink-0"
                              checked={Boolean(lecture.completed)}
                              readOnly
                              onClick={(event) => event.stopPropagation()}
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayerPage;