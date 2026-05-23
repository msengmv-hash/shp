import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useLogin } from "@/features/auth/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useToastStore } from "@/shared/ui/toast";

export function LoginPage() {
  const { register, handleSubmit } = useForm<{ username: string; password: string }>();
  const navigate = useNavigate();
  const push = useToastStore((state) => state.push);
  const login = useLogin();

  function submit(data: { username: string; password: string }) {
    login.mutate(data, {
      onSuccess: () => {
        push("Вы вошли в аккаунт", "success");
      navigate("/profile");
      },
      onError: () => push("Не удалось войти. Проверьте логин и пароль", "error"),
    });
  }

  return (
    <div className="container-page flex min-h-[520px] items-center justify-center py-8">
      <form className="w-full max-w-md rounded-md border border-brand-line p-6 shadow-soft" onSubmit={handleSubmit(submit)}>
        <h1 className="text-2xl font-black">Вход</h1>
        <div className="mt-5 grid gap-3">
          <Input placeholder="Логин" {...register("username", { required: true })} />
          <Input placeholder="Пароль" type="password" {...register("password", { required: true })} />
          <Button disabled={login.isPending}>Войти</Button>
          <Link to="/register" className="text-center text-sm font-semibold text-brand-red">Создать аккаунт</Link>
        </div>
      </form>
    </div>
  );
}
