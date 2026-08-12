import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';
import { Info, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';

const VALUES: { icon: React.ReactNode; title: string; description: string }[] = [
  {
    icon: <ShoppingBag size={20} color="var(--primary)" />,
    title: 'A local marketplace',
    description: 'We connect nearby sellers with customers looking for everyday groceries and essentials, all in one storefront.',
  },
  {
    icon: <Truck size={20} color="var(--primary)" />,
    title: 'Delivery or pickup',
    description: 'Choose to have your order delivered to your door or picked up directly from the seller, whichever suits you best.',
  },
  {
    icon: <ShieldCheck size={20} color="var(--primary)" />,
    title: 'Secure by design',
    description: 'Every order and account is protected end-to-end, so you can shop and track your purchases with confidence.',
  },
];

const AboutUs: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <SidebarMenu />

        <main style={{
          flex: 1, maxWidth: '760px', margin: '0 auto',
          padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: '24px',
          overflowX: 'hidden',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: 'var(--font-display)',
            }}>
              <Info size={22} color="var(--primary)" /> About Us
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
              We're building a simple, trustworthy way for local sellers and customers to do business
              online — from browsing and ordering to pickup, packing, and delivery.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {VALUES.map((value) => (
              <div
                key={value.title}
                style={{
                  display: 'flex', gap: '14px', alignItems: 'flex-start',
                  background: '#ffffff', border: '1px solid var(--border-color)',
                  borderRadius: '12px', padding: '18px',
                }}
              >
                <div style={{
                  flexShrink: 0, width: '40px', height: '40px', borderRadius: '10px',
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {value.icon}
                </div>
                <div>
                  <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>
                    {value.title}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#ffffff', border: '1px solid var(--border-color)',
            borderRadius: '12px', padding: '18px',
          }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>Get in touch</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
              Have a question about an order or a store? Reach out to the seller directly from your
              order details, or visit our Help Center for support.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AboutUs;
