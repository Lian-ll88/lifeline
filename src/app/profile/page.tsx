"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";

interface EmergencyProfile {
  bloodType: string;
  allergies: string;
  medications: string;
  conditions: string;
  emergencyContact1Name: string;
  emergencyContact1Phone: string;
  emergencyContact2Name: string;
  emergencyContact2Phone: string;
  languages: string;
}

const defaultProfile: EmergencyProfile = {
  bloodType: "",
  allergies: "",
  medications: "",
  conditions: "",
  emergencyContact1Name: "",
  emergencyContact1Phone: "",
  emergencyContact2Name: "",
  emergencyContact2Phone: "",
  languages: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<EmergencyProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lifeline_emergency_profile");
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  function handleSave() {
    localStorage.setItem("lifeline_emergency_profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function update(field: keyof EmergencyProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-2xl space-y-6 px-4 pb-8 pt-20">
        <h1 className="text-2xl font-bold">个人档案</h1>

        <ProfileCard />

        <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">紧急医疗信息</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="血型" value={profile.bloodType} onChange={(v) => update("bloodType", v)} placeholder="例如: A+" />
            <Field label="语言能力" value={profile.languages} onChange={(v) => update("languages", v)} placeholder="例如: 中文, English" />
          </div>

          <Field label="过敏信息" value={profile.allergies} onChange={(v) => update("allergies", v)} placeholder="药物、食物过敏等" multiline />
          <Field label="正在服用的药物" value={profile.medications} onChange={(v) => update("medications", v)} placeholder="药物名称和剂量" multiline />
          <Field label="既往病史" value={profile.conditions} onChange={(v) => update("conditions", v)} placeholder="慢性疾病、手术史等" multiline />
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">紧急联系人</h2>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-muted">联系人 1</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="姓名" value={profile.emergencyContact1Name} onChange={(v) => update("emergencyContact1Name", v)} placeholder="姓名" />
              <Field label="电话" value={profile.emergencyContact1Phone} onChange={(v) => update("emergencyContact1Phone", v)} placeholder="+86 ..." />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border p-4">
            <p className="text-sm font-medium text-muted">联系人 2</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="姓名" value={profile.emergencyContact2Name} onChange={(v) => update("emergencyContact2Name", v)} placeholder="姓名" />
              <Field label="电话" value={profile.emergencyContact2Phone} onChange={(v) => update("emergencyContact2Phone", v)} placeholder="+86 ..." />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full rounded-xl py-3 text-sm font-medium text-white transition-colors ${
            saved ? "bg-green-600" : "bg-accent hover:bg-accent-dark"
          }`}
        >
          {saved ? "✓ 已保存" : "保存紧急档案"}
        </button>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const cls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}
