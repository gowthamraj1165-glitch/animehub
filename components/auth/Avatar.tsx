type AvatarProps = {
  username: string;
  avatarUrl: string | null;
  size: number;
  className?: string;
};

/** Avatar image with an initials fallback. Purely presentational. */
export function Avatar({ username, avatarUrl, size, className = "" }: AvatarProps) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar hosts vary (Google, GitHub, ...)
      <img
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-white ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {username.slice(0, 1).toUpperCase()}
    </span>
  );
}
