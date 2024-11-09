'use client';

export const getLocalActiveAccount = (network: string): string | null => {
  return localStorage.getItem(`${network}_active_account`);
};

export const setLocalActiveAccount = (network: string, address: string) => {
  localStorage.setItem(`${network}_active_account`, address);
};

export const removeLocalActiveAccount = (network: string) => {
  localStorage.removeItem(`${network}_active_account`);
};

export const getLocalExtensions = (): string[] => {
  const extensions = localStorage.getItem('active_extensions');
  return extensions ? JSON.parse(extensions) : [];
};

export const addLocalExtension = (id: string) => {
  const extensions = getLocalExtensions();
  if (!extensions.includes(id)) {
    extensions.push(id);
    localStorage.setItem('active_extensions', JSON.stringify(extensions));
  }
};

export const removeLocalExtension = (id: string) => {
  const extensions = getLocalExtensions();
  const filtered = extensions.filter((ext) => ext !== id);
  localStorage.setItem('active_extensions', JSON.stringify(filtered));
};