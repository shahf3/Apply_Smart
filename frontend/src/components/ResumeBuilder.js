import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";

const sectionOrder = [
  "personal", "summary", "education", "experience", "skills", "projects", "certifications"
];

const defaultSections = {
  personal: { name: "", email: "", phone: "", address: "" },
  summary: { text: "" },
  education: [{ school: "", degree: "", year: "" }],
  experience: [{ company: "", title: "", start: "", end: "", bullets: [""] }],
  skills: [""],
  projects: [{ name: "", description: "" }],
  certifications: [""]
};

const sectionLabels = {
  personal: "Personal Info",
  summary: "Summary",
  education: "Education",
  experience: "Experience",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications"
};

function ResumeBuilder() {
  const [sections, setSections] = useState(defaultSections);
  const [selectedTheme, setSelectedTheme] = useState("classic");
  const [includeCoverPage, setIncludeCoverPage] = useState(false);
  const previewRef = useRef();

  const handleChange = (section, idx, field, value) => {
    setSections(prev => {
      const updated = { ...prev };
      if (Array.isArray(updated[section])) {
        updated[section][idx][field] = value;
      } else {
        updated[section][field] = value;
      }
      return updated;
    });
  };

  const handleAdd = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: [...prev[section], section === "education"
        ? { school: "", degree: "", year: "" }
        : section === "experience"
        ? { company: "", title: "", start: "", end: "", bullets: [""] }
        : section === "projects"
        ? { name: "", description: "" }
        : ""]
    }));
  };

  const handleRemove = (section, idx) => {
    setSections(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== idx)
    }));
  };

  const handlePrint = useReactToPrint({
    content: () => previewRef.current,
    documentTitle: "My_Resume"
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 bg-white rounded-xl shadow border border-blue-100">
      <div className="w-full md:w-1/2 space-y-6">
        <div className="flex gap-4 items-center">
          <label>Theme: </label>
          <select className="border p-2 rounded" value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)}>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </select>
          <label className="ml-4">
            <input type="checkbox" checked={includeCoverPage} onChange={(e) => setIncludeCoverPage(e.target.checked)} /> Include Cover Page
          </label>
        </div>

        {sectionOrder.map(section => (
          <div key={section} className="bg-white rounded-xl shadow p-4">
            <h3 className="text-xl font-semibold mb-2">{sectionLabels[section]}</h3>
            {section === "personal" && (
              <>
                {Object.keys(sections.personal).map(key => (
                  <input key={key} className="input" placeholder={key} value={sections.personal[key]} onChange={e => handleChange("personal", null, key, e.target.value)} />
                ))}
              </>
            )}
            {section === "summary" && (
              <textarea className="input" placeholder="Summary" value={sections.summary.text} onChange={e => handleChange("summary", null, "text", e.target.value)} />
            )}
            {section === "education" && sections.education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <input className="input" placeholder="School" value={edu.school} onChange={e => handleChange("education", idx, "school", e.target.value)} />
                <input className="input" placeholder="Degree" value={edu.degree} onChange={e => handleChange("education", idx, "degree", e.target.value)} />
                <input className="input" placeholder="Year" value={edu.year} onChange={e => handleChange("education", idx, "year", e.target.value)} />
                <button className="btn" onClick={() => handleRemove("education", idx)}>Remove</button>
              </div>
            ))}
            {section === "education" && <button className="btn" onClick={() => handleAdd("education")}>Add Education</button>}
            {section === "experience" && sections.experience.map((exp, idx) => (
              <div key={idx} className="mb-2">
                <input className="input" placeholder="Company" value={exp.company} onChange={e => handleChange("experience", idx, "company", e.target.value)} />
                <input className="input" placeholder="Title" value={exp.title} onChange={e => handleChange("experience", idx, "title", e.target.value)} />
                <input className="input" placeholder="Start" value={exp.start} onChange={e => handleChange("experience", idx, "start", e.target.value)} />
                <input className="input" placeholder="End" value={exp.end} onChange={e => handleChange("experience", idx, "end", e.target.value)} />
                {exp.bullets.map((b, bidx) => (
                  <input key={bidx} className="input" placeholder="Bullet" value={b} onChange={e => {
                    const newBullets = [...exp.bullets];
                    newBullets[bidx] = e.target.value;
                    setSections(prev => {
                      const updated = { ...prev };
                      updated.experience[idx].bullets = newBullets;
                      return updated;
                    });
                  }} />
                ))}
                <button className="btn" onClick={() => handleRemove("experience", idx)}>Remove</button>
              </div>
            ))}
            {section === "experience" && <button className="btn" onClick={() => handleAdd("experience")}>Add Experience</button>}
            {section === "skills" && (
              <>
                {sections.skills.map((skill, idx) => (
                  <input key={idx} className="input" placeholder="Skill" value={skill} onChange={e => {
                    const newSkills = [...sections.skills];
                    newSkills[idx] = e.target.value;
                    setSections(prev => ({ ...prev, skills: newSkills }));
                  }} />
                ))}
                <button className="btn" onClick={() => handleAdd("skills")}>Add Skill</button>
              </>
            )}
            {section === "projects" && sections.projects.map((proj, idx) => (
              <div key={idx} className="mb-2">
                <input className="input" placeholder="Project Name" value={proj.name} onChange={e => handleChange("projects", idx, "name", e.target.value)} />
                <textarea className="input" placeholder="Description" value={proj.description} onChange={e => handleChange("projects", idx, "description", e.target.value)} />
                <button className="btn" onClick={() => handleRemove("projects", idx)}>Remove</button>
              </div>
            ))}
            {section === "projects" && <button className="btn" onClick={() => handleAdd("projects")}>Add Project</button>}
            {section === "certifications" && (
              <>
                {sections.certifications.map((cert, idx) => (
                  <input key={idx} className="input" placeholder="Certification" value={cert} onChange={e => {
                    const newCerts = [...sections.certifications];
                    newCerts[idx] = e.target.value;
                    setSections(prev => ({ ...prev, certifications: newCerts }));
                  }} />
                ))}
                <button className="btn" onClick={() => handleAdd("certifications")}>Add Certification</button>
              </>
            )}
          </div>
        ))}
        {console.log("previewRef.current", previewRef.current)}
        <button className="btn bg-green-600 text-white" onClick={handlePrint}>Download PDF</button>
      </div>

      <div ref={previewRef} className={`w-full md:w-1/2 bg-gray-50 rounded-xl shadow p-8 resume-preview ${selectedTheme}`}>
        {includeCoverPage && (
          <div className="mb-6 pb-6 border-b">
            <h1 className="text-4xl font-bold mb-2">{sections.personal.name}</h1>
            <p>{sections.personal.email} | {sections.personal.phone} | {sections.personal.address}</p>
            <p className="mt-4 italic">This document contains my resume for your consideration. Thank you.</p>
          </div>
        )}
        <h2 className="text-xl font-semibold">Summary</h2>
        <p>{sections.summary.text}</p>
        <h2 className="text-xl font-semibold mt-4">Education</h2>
        {sections.education.map((edu, idx) => (
          <div key={idx}>
            <strong>{edu.degree}</strong> - {edu.school} ({edu.year})
          </div>
        ))}
        <h2 className="text-xl font-semibold mt-4">Experience</h2>
        {sections.experience.map((exp, idx) => (
          <div key={idx} className="mb-2">
            <strong>{exp.title}</strong> at {exp.company} ({exp.start} - {exp.end})
            <ul className="list-disc ml-6">
              {exp.bullets.map((b, bidx) => <li key={bidx}>{b}</li>)}
            </ul>
          </div>
        ))}
        <h2 className="text-xl font-semibold mt-4">Skills</h2>
        <ul className="list-disc ml-6">
          {sections.skills.map((skill, idx) => <li key={idx}>{skill}</li>)}
        </ul>
        <h2 className="text-xl font-semibold mt-4">Projects</h2>
        {sections.projects.map((proj, idx) => (
          <div key={idx}>
            <strong>{proj.name}</strong>: {proj.description}
          </div>
        ))}
        <h2 className="text-xl font-semibold mt-4">Certifications</h2>
        <ul className="list-disc ml-6">
          {sections.certifications.map((cert, idx) => <li key={idx}>{cert}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default ResumeBuilder;
