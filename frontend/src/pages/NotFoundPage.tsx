import { Link } from "react-router-dom";

import { Button } from "@/shared/ui/button";

export function NotFoundPage() {
  return <div className="container-page grid min-h-[520px] place-items-center py-8 text-center"><div><h1 className="text-6xl font-black">404</h1><p className="mt-3 text-zinc-500">Страница не найдена</p><Link to="/"><Button className="mt-6">На главную</Button></Link></div></div>;
}
