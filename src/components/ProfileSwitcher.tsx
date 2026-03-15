import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { X, UserPlus } from "lucide-react";

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
      id: `p${Date.now()}`, name, type,
      avatar: type === "child" ? "👶" : "🙂",
      birthYear,
      handoverAge: type === "child" ? 16 : undefined,
    };
    setState((s) => ({ ...s, profiles: [...s.profiles, newProfile] }));
    setShowAdd(false); setName("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="modal-overlay" onClick={onClose} />
          <motion.div className="modal-content max-w-md"
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}>
            <div className="modal-header">
              <h2 className="text-xl">Profiles</h2>
              <button onClick={onClose} className="modal-close"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="space-y-1.5 mb-5">
              {state.profiles.map((profile) => (
                <button key={profile.id} onClick={() => { switchProfile(profile.id); onClose(); }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all duration-200 ${
                    state.currentProfile === profile.id ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-foreground hover:bg-secondary"
                  }`}>
                  <span className="text-xl">{profile.avatar}</span>
                  <div>
                    <p className="text-[13px] font-medium">{profile.name}</p>
                    <p className={`text-[11px] ${state.currentProfile === profile.id ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                      {profile.type === "child" ? `Child · Born ${profile.birthYear}` : "Adult"}
                      {profile.handoverAge && ` · Handover at ${profile.handoverAge}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {!showAdd ? (
              <button onClick={() => setShowAdd(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-border text-[13px] text-muted-foreground/60 hover:text-muted-foreground hover:border-primary/20 transition-all duration-200">
                <UserPlus className="w-4 h-4" /> Add profile
              </button>
            ) : (
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex gap-2">
                  {(["adult", "child"] as const).map((t) => (
                    <button key={t} onClick={() => setType(t)}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium capitalize transition-all duration-200 ${
                        type === t ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-muted-foreground"
                      }`}>{t}</button>
                  ))}
                </div>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="field-input" />
                <input type="number" value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))} className="field-input" />
                <button onClick={addProfile} disabled={!name.trim()} className="btn-primary">Create profile</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileSwitcher;
