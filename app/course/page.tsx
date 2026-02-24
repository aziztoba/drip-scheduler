import { CourseNavbar } from '@/components/dripcourse/course/CourseNavbar';
import { CourseSidebar } from '@/components/dripcourse/course/CourseSidebar';
import { CourseContent } from '@/components/dripcourse/course/CourseContent';
import { LockedModulePanel } from '@/components/dripcourse/course/LockedModulePanel';

export default function CoursePage() {
  return (
    <div
      className="dc-app flex flex-col"
      style={{ minHeight: '100vh', background: '#080E1A' }}
    >
      <CourseNavbar />
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        <CourseSidebar />
        <CourseContent />
        <LockedModulePanel />
      </div>
    </div>
  );
}
