export const getCookie = (key: string) => {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : undefined;
};

export const setCookie = (key: string, value: string) => {
  const secure = location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}`;
};

export const deleteCookie = (key: string) => {
  document.cookie = `${key}=; Path=/; Max-Age=0`;
};
