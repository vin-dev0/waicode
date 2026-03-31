"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { User, Bell, Shield, Palette, Mail, Link as LinkIcon, Camera } from "lucide-react";

export default function UserSettings() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  const sidebarItems = [
    { id: "profile", label: "Public profile", icon: User },
    { id: "account", label: "Account", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-canvas text-fg pb-20">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-1">
             <h2 className="text-xs font-bold text-gh-gray uppercase tracking-widest px-3 mb-4">User Settings</h2>
             {sidebarItems.map((item) => {
               const Icon = item.icon;
               return (
                 <button
                   key={item.id}
                   onClick={() => setActiveTab(item.id)}
                   className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                     activeTab === item.id
                       ? "bg-repo-hover text-fg border-l-4 border-gh-blue"
                       : "text-gh-gray hover:bg-repo-hover hover:text-fg"
                   }`}
                 >
                   <Icon className="w-4 h-4" />
                   <span>{item.label}</span>
                 </button>
               );
             })}
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-2xl">
            {activeTab === "profile" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <section>
                  <h2 className="text-2xl font-black mb-1 border-b border-border-muted pb-4 tracking-tight">Public profile</h2>
                  <div className="mt-8 flex flex-col md:flex-row md:items-start gap-10">
                     <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                           <label className="block text-sm font-bold opacity-80">Name</label>
                           <input 
                              type="text" 
                              className="w-full bg-header border border-border-subtle rounded-lg px-4 py-2 focus:ring-2 focus:ring-gh-blue/20 focus:border-gh-blue transition-all"
                              defaultValue={session?.user?.name || ""}
                           />
                           <p className="text-[10px] text-gh-gray mt-1 font-medium">Your name may appear around WaiCode where you contribute or are mentioned.</p>
                        </div>
                        <div className="space-y-2">
                           <label className="block text-sm font-bold opacity-80">Public email</label>
                           <select className="w-full bg-header border border-border-subtle rounded-lg px-4 py-2 focus:ring-2 focus:ring-gh-blue/20 focus:border-gh-blue transition-all">
                              <option>{session?.user?.email}</option>
                              <option>Don't show my email</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="block text-sm font-bold opacity-80">Bio</label>
                           <textarea 
                              className="w-full bg-header border border-border-subtle rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-gh-blue/20 focus:border-gh-blue transition-all"
                              placeholder="Tell us a little bit about yourself"
                           ></textarea>
                           <p className="text-[10px] text-gh-gray mt-1 font-medium italic">You can @mention other users and organizations to link to them.</p>
                        </div>
                        <div className="pt-4">
                           <button className="bg-gh-green text-white font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all border-b-2 border-green-800 shadow-lg shadow-gh-green/10">
                              Update profile
                           </button>
                        </div>
                     </div>
                     
                     <div className="w-48 space-y-4">
                        <label className="block text-sm font-bold opacity-80">Profile picture</label>
                        <div className="relative group">
                           <div className="w-48 h-48 rounded-full border-2 border-border-subtle overflow-hidden bg-header flex items-center justify-center">
                              <User className="w-20 h-20 text-gh-gray/20" />
                           </div>
                           <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <Camera className="w-8 h-8 text-white mb-2" />
                              <span className="text-[10px] text-white font-bold uppercase tracking-widest">Edit</span>
                           </div>
                        </div>
                     </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <section>
                   <h2 className="text-2xl font-black mb-1 border-b border-border-muted pb-4 tracking-tight">Appearance</h2>
                   <p className="text-sm text-gh-gray mt-4 font-medium leading-relaxed">
                      Control how WaiCode looks to you. Select a theme, or sync with your system.
                   </p>
                   
                   <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="gh-card p-6 cursor-pointer border-2 border-gh-blue shadow-gh-blue/5 bg-header">
                         <div className="w-full h-32 bg-canvas border border-border-subtle rounded-md mb-4 flex items-center justify-center overflow-hidden">
                             <div className="w-4/5 space-y-2">
                                <div className="h-2 w-1/2 bg-gh-blue/20 rounded"></div>
                                <div className="h-2 w-full bg-border-muted rounded"></div>
                                <div className="h-2 w-3/4 bg-border-muted rounded"></div>
                             </div>
                         </div>
                         <h3 className="font-bold text-fg mb-1">Light Mode</h3>
                         <p className="text-[10px] text-gh-gray font-bold uppercase">The classic look</p>
                      </div>
                      
                      <div className="gh-card p-6 cursor-pointer hover:border-gh-blue transition-all">
                         <div className="w-full h-32 bg-[#0d1117] border border-[#30363d] rounded-md mb-4 flex items-center justify-center overflow-hidden">
                             <div className="w-4/5 space-y-2">
                                <div className="h-2 w-1/2 bg-[#58a6ff]/20 rounded"></div>
                                <div className="h-2 w-full bg-[#30363d] rounded"></div>
                                <div className="h-2 w-3/4 bg-[#30363d] rounded"></div>
                             </div>
                         </div>
                         <h3 className="font-bold text-fg mb-1">Dark Mode</h3>
                         <p className="text-[10px] text-gh-gray font-bold uppercase tracking-widest">For night owls</p>
                      </div>
                   </div>
                </section>
              </div>
            )}
            
            {activeTab === "account" && (
               <div className="space-y-12 animate-in fade-in duration-300">
                  <section>
                     <h2 className="text-2xl font-black mb-1 border-b border-border-muted pb-4 tracking-tight">Account settings</h2>
                     <div className="mt-10 space-y-8">
                        <div>
                           <h4 className="font-bold mb-2 text-fg">Change username</h4>
                           <p className="text-xs text-gh-gray mb-4">Changing your username can have unintended side effects. <span className="text-gh-blue hover:underline cursor-pointer">Learn more</span></p>
                           <button className="bg-header border border-border-subtle hover:bg-repo-hover text-fg font-bold px-4 py-2 rounded-lg transition-all border-b-2">
                              Change username
                           </button>
                        </div>
                        
                        <div className="pt-8 border-t border-border-muted">
                           <h4 className="font-extrabold text-red-500 mb-2 uppercase tracking-widest text-[10px]">Danger Zone</h4>
                           <div className="gh-card border-red-500/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                              <div>
                                 <h5 className="font-bold text-fg">Delete account</h5>
                                 <p className="text-xs text-gh-gray mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                              </div>
                              <button className="whitespace-nowrap px-4 py-2 bg-red-500/10 text-red-500 font-bold border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                 Delete your account
                              </button>
                           </div>
                        </div>
                     </div>
                  </section>
               </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
