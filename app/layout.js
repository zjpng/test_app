export const metadata = {
  title: "Ripple Simulation",
  description: "Interactive 2D wave ripple simulation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#000", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
