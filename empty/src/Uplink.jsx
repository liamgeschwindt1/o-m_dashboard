import { motion } from "framer-motion";
import { Upload } from "lucide-react";

export function Uplink({ onUpload }) {
  return (
    <motion.label
      className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent rounded cursor-pointer font-mono text-accent hover:bg-accent/20 transition-colors"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Upload className="w-5 h-5" />
      <span>Uplink</span>
      <input
        type="file"
        className="hidden"
        onChange={e => onUpload?.(e.target.files)}
      />
    </motion.label>
  );
}
