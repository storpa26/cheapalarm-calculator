// Placeholder toast hook for notifications
export const useToast = () => {
  return {
    toast: ({ title, description, variant = 'default' }) => {
      console.log(`Toast [${variant}]: ${title} - ${description}`);
    }
  };
};