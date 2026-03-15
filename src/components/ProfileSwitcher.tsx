import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { X, UserPlus, Users } from "lucide-react";

interface ProfileSwitcherProps {
  open: boolean;
  onClose: () => void;
}

const ProfileSwitcher = ({ open, onClose }: ProfileSwitcherProps) => {
  const { state, setState, switchProfile } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"adult" | "child">("child");
  const [birthYear, setBirthYear] = useState(2020);

  const addProfile = () => {
    if (!name.trim()) return;
    const newProfile = {
      id: `p${Date.now()}`,
      name,
      type,
      avatar: type === "child" ? "👶" : "🙂",
      birthYear,
      handoverAge: type === "child" ? 16 : undefined,
    };
    setState((s) => ({ ...s, profiles: [...s.profiles, newProfile] }));
    setShowAdd(false);
    setName("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div className="relative bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-elevated z-10"
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl flex items-center gap-2"><Users className="w-5 h-5" /> Profiles</h2>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {state.profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => { switchProfile(profile.id); onClose(); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    state.currentProfile === profile.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span className="text-2xl">{profile.avatar}</span>
                  <div>
                    <p className="text-sm font-medium">{profile.name}</p>
                    <p className={`text-xs ${state.currentProfile === profile.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {profile.type === "child" ? `Child · Born ${profile.birthYear}` : "Adult"}
                      {profile.handoverAge && ` · Handover at ${profile.handoverAge}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {!showAdd ? (
              <button onClick={() => setShowAdd(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                <UserPlus className="w-4 h-4" /> Add profile
              </button>
            ) : (
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="flex gap-2 pt-4">
                  {(["adult", "child"] as const).map((t) => (
                    <button key={t} onClick={() => setType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm border-0 outline-none" />
                <input type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm border-0 outline-none" />
                <button onClick={addProfile} disabled={!name.trim()}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm disabled:opacity-40">
                  Create profile
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileSwitcher;
