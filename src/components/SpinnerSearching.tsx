import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, UserIdVerificationIcon } from '@hugeicons/core-free-icons'

interface Props {
  isActive?: boolean;
}

export const SpinnerSearching = ({ isActive }: Props) => {
  return (
    <div
      className={`absolute top-0 left-0 h-dvh w-full flex items-center justify-center transition-all ${
        isActive ? "opacity-100 visible" : "opacity-0 invisible"
      } z-[99999]`}
    >
      <div className="z-20 relative flex flex-col items-center gap-2">
        <div>
          <div className="relative z-20">
            <div className="orbit-container">
              <div className="orbiting-icon">
                <HugeiconsIcon icon={Search01Icon} size={32} strokeWidth={1.5} />
              </div>
            </div>         
          </div>
          <div className='absolute top-0 z-10'>
            <HugeiconsIcon icon={UserIdVerificationIcon} size={48} strokeWidth={1.5} color="var(--color-gray-600)" />
          </div>
        </div>
        <div>Matching designer...</div>
      </div>
      <span className="absolute z-10 h-dvh w-full bg-background opacity-80 top-0 left-0"></span>
    </div>
  );
};
