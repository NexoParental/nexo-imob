import CadastroForm from './CadastroForm'

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-accent mb-4">
            <span className="text-accent font-bold text-lg">N</span>
          </div>
          <h1 className="text-2xl font-bold">Criar conta · Nexo Imob</h1>
          <p className="text-sm text-ink-soft mt-1">14 dias grátis, sem cartão de crédito.</p>
        </div>
        <CadastroForm />
      </div>
    </div>
  )
}
