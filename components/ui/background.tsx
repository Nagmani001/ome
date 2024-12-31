import { motion } from "framer-motion";
import { AuroraBackground } from "../ui/aurora-background";
import { useRouter } from 'next/navigation'

export function AuroraBackgroundDemo() {
  const router = useRouter();
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          For Devs Who Want to Connect and Create
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
          Chat and collaborate with fellow developers in real-time.
        </div>
        <button onClick={() => {
          router.push("/room")
        }} className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-8 py-4">
          Start Video
        </button>
      </motion.div>
    </AuroraBackground>
  );
}
