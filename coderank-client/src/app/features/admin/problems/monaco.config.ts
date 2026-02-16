export const monacoConfig = {
  baseUrl: 'assets/monaco-editor',
  defaultOptions: {
    scrollBeyondLastLine: false,
    roundedSelection: false,
    readOnly: false,
    automaticLayout: true,
  },
  onMonacoLoad: () => {
    // Monaco loaded successfully
    console.log('Monaco Editor loaded');
  },
};
