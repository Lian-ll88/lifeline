"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, UserProfile } from "@/hooks/useUser";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Save to localStorage
    // In a real app, this would be a POST to /api/user/profile
    const updatedProfile = { ...user, ...formData };
    localStorage.setItem("lifeline_profile", JSON.stringify(updatedProfile));
    
    // Trigger a storage event to update other components if they listen (optional)
    window.dispatchEvent(new Event("storage"));
    
    setSaving(false);
    setSuccess(true);
    
    setTimeout(() => setSuccess(false), 2000);
  };

  if (loading) return <div className="flex h-screen items-center justify-center">加载中...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="rounded-lg p-2 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800">
            ← 返回 SOS 主界面
          </Link>
        </div>

        <div className="space-y-2">
           <h1 className="text-3xl font-bold">完善紧急档案</h1>
           <p className="text-muted-foreground">这些信息将在紧急情况下提供给救援人员</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-900">
          {/* User Info Read-only */}
          <div className="flex items-center gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
             {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="h-16 w-16 rounded-full" />
             ) : (
                <div className="h-16 w-16 rounded-full bg-zinc-200" />
             )}
             <div>
               <p className="font-bold text-lg">{formData.name}</p>
               <p className="text-sm text-muted-foreground">SecondMe 认证用户</p>
             </div>
          </div>

          {/* Medical Info */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg text-sos">
              <span>🏥</span> 医疗急救卡
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">血型 <span className="text-red-500">*</span></label>
                <select 
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 outline-none focus:border-sos dark:border-zinc-700 dark:bg-zinc-800"
                  value={formData.bloodType || ""}
                  onChange={e => setFormData({...formData, bloodType: e.target.value})}
                  required
                >
                  <option value="">请选择</option>
                  <option value="A型">A型</option>
                  <option value="B型">B型</option>
                  <option value="AB型">AB型</option>
                  <option value="O型">O型</option>
                  <option value="未知">未知</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">过敏史 <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 outline-none focus:border-sos dark:border-zinc-700 dark:bg-zinc-800"
                  placeholder="如: 青霉素, 花生"
                  value={formData.allergies || ""}
                  onChange={e => setFormData({...formData, allergies: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg text-blue-600">
              <span>📞</span> 紧急联系人
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">姓名 <span className="text-red-500">*</span></label>
              <input 
                type="text"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 outline-none focus:border-sos dark:border-zinc-700 dark:bg-zinc-800"
                placeholder="紧急联系人姓名"
                value={formData.emergencyContact || ""}
                onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">电话 <span className="text-red-500">*</span></label>
              <input 
                type="tel"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 outline-none focus:border-sos dark:border-zinc-700 dark:bg-zinc-800"
                placeholder="紧急联系人电话"
                value={formData.emergencyPhone || ""}
                onChange={e => setFormData({...formData, emergencyPhone: e.target.value})}
                required
              />
            </div>
          </div>

           {/* Language */}
           <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg text-purple-600">
              <span>🌐</span> 语言能力
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">掌握语言 <span className="text-red-500">*</span></label>
              <input 
                type="text"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 outline-none focus:border-sos dark:border-zinc-700 dark:bg-zinc-800"
                placeholder="如: 中文(母语), 英语(流利)"
                value={formData.languages || ""}
                onChange={e => setFormData({...formData, languages: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-sos py-4 font-bold text-white shadow-lg transition-all hover:bg-sos-dark hover:shadow-xl active:scale-95 disabled:opacity-70"
            >
              {saving ? "保存中..." : "保存档案"}
            </button>
          </div>

          {success && (
            <div className="animate-fade-in text-center text-green-600 font-medium">
              ✅ 档案已更新并同步到本地存储
            </div>
          )}
        </form>
      </div>
    </div>
  );
}