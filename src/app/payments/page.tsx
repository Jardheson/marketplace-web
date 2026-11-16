import { PaymentForm } from '@/components/PaymentForm';

export default function PaymentsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Pagamentos</h1>
      <PaymentForm />
    </section>
  );
}
