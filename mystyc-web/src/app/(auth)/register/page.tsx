import RegisterForm from '@/components/app/auth/RegisterForm';

export default function RegisterPage() {

  return (
    <div className="flex flex-1 items-center justify-center -mt-20">
      <div className="w-full max-w-md text-center px-4 border rounded-md p-6 shadow-sm bg-white">
        <RegisterForm />
      </div>
    </div>
  )
}