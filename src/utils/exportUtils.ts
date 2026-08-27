import { PartyPlan, ShoppingItem } from '../types';

export function exportToCSV(plan: PartyPlan): void {
  const headers = ['Category', 'Item Name', 'Quantity', 'Unit', 'Estimated Cost ($)', 'Store', 'Priority', 'Checked', 'Notes'];
  const rows = plan.items.map((item) => [
    `"${item.category}"`,
    `"${item.name.replace(/"/g, '""')}"`,
    item.quantity,
    `"${item.unit}"`,
    item.estimatedCost.toFixed(2),
    `"${item.store}"`,
    `"${item.priority}"`,
    item.checked ? 'YES' : 'NO',
    `"${(item.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${plan.details.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_shopping_list.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatAsMarkdown(plan: PartyPlan): string {
  const { details, items, portionMetrics, signatureRecipe } = plan;
  const totalCost = items.reduce((acc, it) => acc + it.estimatedCost, 0);
  const checkedCost = items.filter((it) => it.checked).reduce((acc, it) => acc + it.estimatedCost, 0);

  const categories = Array.from(new Set(items.map((i) => i.category)));

  let md = `# 🎈 Party Shopping List: ${details.title}\n`;
  md += `**Theme:** ${details.theme} | **Guests:** ${details.guestCount} (${details.adultCount} adults, ${details.kidCount} kids) | **Duration:** ${details.durationHours} hrs\n`;
  md += `**Budget:** $${details.budget} | **Estimated Total:** $${totalCost.toFixed(2)} (Spent so far: $${checkedCost.toFixed(2)})\n\n`;

  categories.forEach((cat) => {
    const catItems = items.filter((it) => it.category === cat);
    const catTotal = catItems.reduce((acc, it) => acc + it.estimatedCost, 0);
    md += `## 🏷️ ${cat.toUpperCase()} ($${catTotal.toFixed(2)})\n`;
    catItems.forEach((it) => {
      const checkMark = it.checked ? '[x]' : '[ ]';
      const prio = it.priority === 'must-have' ? '🔴 Must-Have' : it.priority === 'nice-to-have' ? '🟡 Nice-to-Have' : '⚪ Backup';
      md += `- ${checkMark} **${it.name}** — ${it.quantity} ${it.unit} (~$${it.estimatedCost.toFixed(2)}) [${it.store}] (${prio})${it.notes ? `\n  *Notes:* ${it.notes}` : ''}\n`;
    });
    md += '\n';
  });

  if (signatureRecipe) {
    md += `## 🍹 Signature Recipe: ${signatureRecipe.title}\n`;
    md += `*${signatureRecipe.description}* (Servings: ${signatureRecipe.servings})\n\n`;
    md += `**Ingredients:**\n`;
    signatureRecipe.ingredients.forEach((ing) => {
      md += `- ${ing.amount} ${ing.name}\n`;
    });
    md += `\n**Instructions:**\n`;
    signatureRecipe.instructions.forEach((ins, idx) => {
      md += `${idx + 1}. ${ins}\n`;
    });
    md += '\n';
  }

  if (portionMetrics && portionMetrics.length > 0) {
    md += `## 📏 Portion Rules & Calculations\n`;
    portionMetrics.forEach((pm) => {
      md += `- **${pm.item} (${pm.category}):** ${pm.recommendedAmount} (${pm.ruleExplanation})\n`;
    });
  }

  return md;
}

export function copyFormattedList(plan: PartyPlan): Promise<boolean> {
  const text = formatAsMarkdown(plan);
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}

export function printShoppingList(plan: PartyPlan): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalCost = plan.items.reduce((acc, it) => acc + it.estimatedCost, 0);
  const itemsByStore: Record<string, ShoppingItem[]> = {};

  plan.items.forEach((item) => {
    if (!itemsByStore[item.store]) itemsByStore[item.store] = [];
    itemsByStore[item.store].push(item);
  });

  const storesHtml = Object.entries(itemsByStore)
    .map(
      ([store, storeItems]) => `
      <div style="margin-bottom: 24px; break-inside: avoid;">
        <h3 style="margin: 0 0 8px 0; border-bottom: 2px solid #333; padding-bottom: 4px; font-size: 16px;">
          🛒 ${store} (${storeItems.length} items - $${storeItems.reduce((a, b) => a + b.estimatedCost, 0).toFixed(2)})
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          ${storeItems
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="width: 24px; padding: 6px 0;">
                <div style="width: 14px; height: 14px; border: 1.5px solid #333; ${item.checked ? 'background: #333;' : ''}"></div>
              </td>
              <td style="padding: 6px 8px; font-weight: 600;">${item.name}</td>
              <td style="padding: 6px 8px; color: #666;">${item.quantity} ${item.unit}</td>
              <td style="padding: 6px 8px; text-align: right; font-weight: 500;">$${item.estimatedCost.toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
        </table>
      </div>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Shopping List - ${plan.details.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #111; max-width: 800px; margin: 0 auto; }
          h1 { margin-bottom: 4px; font-size: 24px; }
          .meta { color: #555; margin-bottom: 20px; font-size: 14px; }
          .summary-box { background: #f4f4f5; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; font-size: 14px; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Print Checklist</button>
        </div>
        <h1>🎈 ${plan.details.title}</h1>
        <div class="meta">
          <strong>Theme:</strong> ${plan.details.theme} | <strong>Guests:</strong> ${plan.details.guestCount} | <strong>Budget:</strong> $${plan.details.budget}
        </div>
        <div class="summary-box">
          <div><strong>Total Items:</strong> ${plan.items.length}</div>
          <div><strong>Estimated Cost:</strong> $${totalCost.toFixed(2)}</div>
          <div><strong>Stores:</strong> ${Object.keys(itemsByStore).length}</div>
        </div>
        ${storesHtml}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
