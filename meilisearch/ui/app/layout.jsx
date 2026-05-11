import "./globals.css";

export const metadata = {
  title: "Meilisearch Console",
  description: "A simple Hostess UI for searching Meilisearch indexes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
