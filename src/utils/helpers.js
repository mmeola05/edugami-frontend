import { date } from "quasar";

export const formatDate = (val, format = "D MMM, HH:mm") => {
  if (!val) return "";
  const d = new Date(val);
  return date.formatDate(d, format);
};

export const formatTimeAgo = (val) => {
  if (!val) return "";
  const d = new Date(val);
  const now = new Date();
  const diff = date.getDateDiff(now, d, "days");

  if (diff === 0) return date.formatDate(d, "HH:mm");
  if (diff === 1) return "Ayer " + date.formatDate(d, "HH:mm");
  return date.formatDate(d, "D MMM, HH:mm");
};

export const formatNumber = (val) => {
  if (val === undefined || val === null) return "-";
  return new Intl.NumberFormat("es-ES").format(val);
};

export const formatCurrency = (val, currency = "EUR") => {
  if (val === undefined || val === null) return "-";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(
    val,
  );
};
