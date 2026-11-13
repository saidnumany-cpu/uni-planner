import { useState } from 'react';

const initials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toLocaleUpperCase('tr-TR');
};

/** Profil fotoğrafı; yüklenemezse baş harfler */
export default function Avatar({ user, size = 36 }) {
  const [failed, setFailed] = useState(false);
  if (user?.photoURL && !failed) {
    return (
      <img
        src={user.photoURL}
        alt=""
        className="avatar"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        // Google profil fotoğrafları referrer gönderilince sıklıkla 403 döner
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="avatar" style={{ width: size, height: size }} aria-hidden="true">
      {initials(user?.displayName || user?.email)}
    </span>
  );
}
