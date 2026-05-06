import { boot } from 'quasar/wrappers';
import { Dark } from 'quasar';

export default boot(() => {
  const savedTheme = localStorage.getItem('edugami_theme');
  if (savedTheme) {
    Dark.set(savedTheme === 'dark');
  } else {
    // Optional: follow system preference
    Dark.set('auto');
  }
});
