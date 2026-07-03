import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-2xl font-bold">Fitur tidak tersedia</h2>

      <p className="mt-2 text-slate-400">
        Fitur ini belum aktif di paket akun kamu.
      </p>

      <Link
        href="/dashboard"
        className="mt-5 inline-block rounded-lg bg-pink-600 px-5 py-3 font-semibold hover:bg-pink-700"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}