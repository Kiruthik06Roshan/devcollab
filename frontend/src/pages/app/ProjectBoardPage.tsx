import { useParams } from 'react-router-dom';
import { TaskBoard } from '@/features/tasks/TaskBoard';

export default function ProjectBoardPage() {
  const params = useParams<{ projectId: string }>();

  if (!params.projectId) {
    return null;
  }

  return <TaskBoard projectId={params.projectId} />;
}