interface SkillTagsProps {
  skills: string[];
}

const SkillTags: React.FC<SkillTagsProps> = ({ skills }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, idx) => (
        <span
          key={idx}
          className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium"
        >
          {skill}
        </span>
      ))}
    </div>
  );
};

export default SkillTags; 