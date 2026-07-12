'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  useDeleteAvatarMutation,
  useUploadAvatarMutation,
} from '@/hooks/profile/useProfileMutations';
import { validateAvatarFile } from '@/utils/profile';
import { handleProfileApiError } from '@/utils/profileError';
import { cn } from '@/utils/cn';

interface AvatarUploaderProps {
  name: string;
  profilePictureUrl: string | null | undefined;
  disabled?: boolean;
  size?: 'xl' | '2xl';
  showUploadLabel?: boolean;
}

export function AvatarUploader({
  name,
  profilePictureUrl,
  disabled,
  size = '2xl',
  showUploadLabel = true,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [syncedUrl, setSyncedUrl] = useState(profilePictureUrl);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const uploadMutation = useUploadAvatarMutation();
  const deleteMutation = useDeleteAvatarMutation();

  // Reset local preview when the server URL changes (avoid setState-in-effect).
  if (profilePictureUrl !== syncedUrl) {
    setSyncedUrl(profilePictureUrl);
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  const displaySrc = preview ?? profilePictureUrl ?? undefined;
  const busy = uploadMutation.isPending || deleteMutation.isPending;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const pickFile = () => {
    if (disabled || busy) return;
    setMenuOpen(false);
    inputRef.current?.click();
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      await uploadMutation.mutateAsync(file);
      toast.success('Avatar updated');
    } catch (err) {
      setPreview(null);
      toast.error(handleProfileApiError(err, 'Failed to upload avatar'));
    }
  };

  const onRemove = async () => {
    setMenuOpen(false);
    if (!profilePictureUrl && !preview) return;
    try {
      await deleteMutation.mutateAsync();
      setPreview(null);
      toast.success('Avatar removed');
    } catch (err) {
      toast.error(handleProfileApiError(err, 'Failed to remove avatar'));
    }
  };

  return (
    <div className="relative inline-flex flex-col items-start gap-3" ref={menuRef}>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => (profilePictureUrl || preview ? setMenuOpen((o) => !o) : pickFile())}
        className={cn(
          'group relative rounded-full ring-2 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50',
          (disabled || busy) && 'opacity-60',
        )}
        aria-label="Change profile photo"
      >
        <Avatar name={name} src={displaySrc} size={size} className="shadow-xl" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" />
        </span>
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-xs font-medium text-white">
            Saving…
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />

      {menuOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <button
            type="button"
            onClick={pickFile}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-secondary-bg"
          >
            <Upload size={14} />
            Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-error hover:bg-red-50/10"
          >
            <Trash2 size={14} />
            Remove
          </button>
        </div>
      )}

      {showUploadLabel && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={pickFile}
          disabled={disabled || busy}
        >
          Edit photo
        </Button>
      )}
    </div>
  );
}
