import { PaymentForm } from '@/components/PaymentForm';

export default function PaymentsPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Pagamentos</h1>
        <p className="mt-1 text-sm text-muted">
          Processe pagamentos de pedidos existentes por PIX, cartao ou boleto.
        </p>
      </header>
      <PaymentForm />
    </section>
  );
}
