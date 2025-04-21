export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <p className="text-sm text-neutral-500">&copy; 2023 EcoManage - Sustainable Community Resource Management</p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="text-sm text-neutral-500 hover:text-primary">Help & Documentation</a>
          <a href="#" className="text-sm text-neutral-500 hover:text-primary">Privacy Policy</a>
          <a href="#" className="text-sm text-neutral-500 hover:text-primary">Terms of Service</a>
          <a href="#" className="text-sm text-neutral-500 hover:text-primary">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}
