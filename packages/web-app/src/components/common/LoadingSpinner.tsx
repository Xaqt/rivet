const LoadingSpinner = ({width = "10",height='10' }) => (
  <div className="flex items-center justify-center">
    <div className={`w-${width} h-${height} ease-linear border-2 border-t-2 rounded-full loader border-slate-200`}></div>
  </div>
);

export { LoadingSpinner };
