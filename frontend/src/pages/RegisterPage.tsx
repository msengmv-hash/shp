import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useRegister } from "@/features/auth/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useToastStore } from "@/shared/ui/toast";

interface RegisterForm {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export function RegisterPage() {
  const { register, handleSubmit } = useForm<RegisterForm>();
  const navigate = useNavigate();
  const push = useToastStore((state) => state.push);
  const mutation = useRegister();

  function submit(data: RegisterForm) {
    mutation.mutate(data, {
      onSuccess: () => {
        push("Аккаунт создан. Теперь можно войти", "success");
        navigate("/login");
      },
      onError: () => push("Не удалось зарегистрироваться", "error"),
    });
  }

  return (
    <div className="container-page flex min-h-[560px] items-center justify-center py-8">
      <form className="w-full max-w-md rounded-md border border-brand-line p-6 shadow-soft" onSubmit={handleSubmit(submit)}>
        <h1 className="text-2xl font-black">Регистрация</h1>
        <div className="mt-5 grid gap-3">
          <Input placeholder="Логин" {...register("username", { required: true })} />
          <Input placeholder="Email" type="email" {...register("email", { required: true })} />
          <Input placeholder="Телефон" {...register("phone")} />
          <Input placeholder="Пароль" type="password" {...register("password", { required: true, minLength: 8 })} />
          <Button disabled={mutation.isPending}>Создать аккаунт</Button>
          <Link to="/login" className="text-center text-sm font-semibold text-brand-red">Уже есть аккаунт</Link>
        </div>
      </form>
    </div>
  );
}
