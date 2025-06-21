interface Assignment {
  project: string;
  start: string; // ISO date
  end: string;   // ISO date
}

interface AssignmentTimelineProps {
  assignments: Assignment[];
}

const AssignmentTimeline: React.FC<AssignmentTimelineProps> = ({ assignments }) => {
  return (
    <div className="space-y-4">
      {assignments.length === 0 && (
        <div className="text-gray-500 text-sm">No assignments found.</div>
      )}
      {assignments.map((a, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <div>
            <div className="font-medium text-gray-800">{a.project}</div>
            <div className="text-xs text-gray-500">
              {new Date(a.start).toLocaleDateString()} - {new Date(a.end).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentTimeline; 