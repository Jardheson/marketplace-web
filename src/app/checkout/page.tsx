import { CheckoutForm } from '@/components/CheckoutForm';

export default function CheckoutPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-muted">
          Revise seu carrinho e finalize o pedido com o metodo de pagamento
          desejado.
        </p>
      </header>
      <CheckoutForm />
    </section>
  );
}
