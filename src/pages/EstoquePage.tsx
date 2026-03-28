import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRestaurantStore } from '@/store/restaurant-store';
import { CATEGORIES } from '@/types/restaurant';
import { Package, Plus, Minus, AlertTriangle, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const LOW_STOCK_THRESHOLD = 5;

const EstoquePage = () => {
  const { products, updateProductStock, toggleProductAvailability } = useRestaurantStore();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [adjustQty, setAdjustQty] = useState<Record<string, string>>({});
  const [showQR, setShowQR] = useState(false);

  const cardapioUrl = `${window.location.origin}/cardapio`;

  const handleAdjust = (productId: string, delta: number) => {
    updateProductStock(productId, delta);
  };

  const handleManualEntry = (productId: string) => {
    const qty = parseInt(adjustQty[productId] || '0');
    if (qty > 0) {
      updateProductStock(productId, qty);
      setAdjustQty((prev) => ({ ...prev, [productId]: '' }));
    }
  };

  const lowStockItems = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0);
  const outOfStockItems = products.filter((p) => p.stock === 0);

  if (showQR) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => setShowQR(false)} className="self-start gap-2">
          ← Voltar
        </Button>
        <h2 className="font-display text-2xl font-bold">Cardápio Digital</h2>
        <p className="text-muted-foreground text-center">
          Escaneie o QR Code para acessar o cardápio
        </p>
        <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 shadow-lg">
          <QRCodeSVG
            value={cardapioUrl}
            size={220}
            bgColor="transparent"
            fgColor="hsl(var(--foreground))"
            level="H"
          />
        </div>
        <p className="text-xs text-muted-foreground break-all text-center max-w-xs">{cardapioUrl}</p>
        <Button variant="outline" onClick={() => navigator.clipboard.writeText(cardapioUrl)}>
          Copiar Link
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Estoque</h2>
        <Button variant="secondary" size="lg" onClick={() => setShowQR(true)}>
          <QrCode className="h-5 w-5" /> QR Cardápio
        </Button>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="space-y-2">
          {outOfStockItems.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                {outOfStockItems.length} item(ns) esgotado(s): {outOfStockItems.map((p) => p.name).join(', ')}
              </span>
            </div>
          )}
          {lowStockItems.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="text-sm font-medium text-warning">
                Estoque baixo: {lowStockItems.map((p) => `${p.name} (${p.stock})`).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Product list */}
      <div className="grid gap-3">
        {products
          .filter((p) => p.category === activeCategory)
          .map((p) => (
            <div
              key={p.id}
              className={`rounded-lg border bg-card p-4 transition-opacity ${
                p.stock === 0 ? 'border-destructive/30 opacity-60' : p.stock <= LOW_STOCK_THRESHOLD ? 'border-warning/30' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    p.stock === 0 ? 'bg-destructive/10' : 'bg-primary/10'
                  }`}>
                    <Package className={`h-5 w-5 ${p.stock === 0 ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">R$ {p.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-display text-2xl font-bold ${
                    p.stock === 0 ? 'text-destructive' : p.stock <= LOW_STOCK_THRESHOLD ? 'text-warning' : 'text-foreground'
                  }`}>
                    {p.stock}
                  </p>
                  <p className="text-xs text-muted-foreground">unid.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-lg"
                  onClick={() => handleAdjust(p.id, -1)}
                  disabled={p.stock === 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon-lg" onClick={() => handleAdjust(p.id, 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
                <input
                  type="number"
                  placeholder="Qtd"
                  value={adjustQty[p.id] || ''}
                  onChange={(e) => setAdjustQty((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="w-20 rounded-md border border-input bg-muted px-2 py-2 text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button variant="secondary" size="sm" onClick={() => handleManualEntry(p.id)}>
                  Entrada
                </Button>
                <Button
                  variant={p.available ? 'outline' : 'destructive'}
                  size="sm"
                  onClick={() => toggleProductAvailability(p.id)}
                >
                  {p.available ? 'Ativo' : 'Inativo'}
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default EstoquePage;
