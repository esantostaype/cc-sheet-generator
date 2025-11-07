import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  VoiceIdIcon,
  Edit02Icon,
  DatabaseSync01Icon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { Avatar, Checkbox, IconButton } from "@mui/joy";

interface UserCardProps {
  user: {
    clickupId: string;
    name: string;
    email: string;
    profilePicture: string;
    initials: string;
    color: string;
    existsInLocal: boolean;
    canSync: boolean;
    lastActive?: string;
  };
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onEdit?: () => void;
  showSelection?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelected = false,
  onSelect,
  onEdit,
  showSelection = true,
}) => {
  return (
    <div
      className={`
      p-6 rounded-lg flex flex-col items-center relative text-center gap-4 
      transition-all border-2
      ${
        user.existsInLocal
          ? "bg-white/4 border-transparent"
          : isSelected
          ? "bg-accent/10 border-accent/30"
          : "bg-accent/10 border-transparent hover:bg-accent/20"
      }
    `}
    >
      {/* Selection checkbox */}
      {showSelection && !user.existsInLocal && onSelect && (
        <div className="absolute top-4 left-4 z-20">
          <Checkbox
            checked={isSelected}
            onChange={(event) => onSelect(event.target.checked)}
          />
        </div>
      )}

      {/* Edit button for existing users */}
      {user.existsInLocal && onEdit && (
        <div className="absolute top-4 right-4 z-20">
          <IconButton size="sm" variant="soft" color="primary" onClick={onEdit}>
            <HugeiconsIcon icon={Edit02Icon} size={16} />
          </IconButton>
        </div>
      )}
      <Avatar
        src={user.profilePicture}
        sx={{
          width: 80,
          height: 80,
          bgcolor: user.color || "primary.500",
          fontSize: "1.5rem",
        }}
      >
        {user.initials}
      </Avatar>

      {/* User Info */}
      <div className="flex-1">
        <div>
          <h3 className="font-semibold text-lg">{user.name}</h3>
          {user.existsInLocal ? (
            <div className="flex items-center gap-1 justify-center text-xs uppercase text-yellow-400">
              <HugeiconsIcon icon={DatabaseSync01Icon} size={16} />
              Synced
            </div>
          ) : (
            <div className="flex items-center gap-1 justify-center text-xs uppercase text-green-400">
              <HugeiconsIcon icon={UserCheck01Icon} size={16} />
              Available
            </div>
          )}
        </div>
      </div>

      {/* User Details */}
      <div className="text-sm flex flex-col gap-1">
        <div className="flex items-center gap-1 justify-center">
          <HugeiconsIcon icon={Mail01Icon} size={16} />
          {user.email}
        </div>
        <div className="flex items-center gap-1 justify-center">
          <HugeiconsIcon icon={VoiceIdIcon} size={16} />
          {user.clickupId}
        </div>
      </div>

      {/* Last Active */}
      {user.lastActive && (
        <div className="text-sm text-gray-400">
          Active: {new Date(parseInt(user.lastActive)).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
