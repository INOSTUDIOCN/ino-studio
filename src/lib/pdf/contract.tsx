import path from "node:path";
import { Document, Page, Text, View, Image, Font, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

Font.register({
  family: "Noto Sans SC",
  src: path.join(process.cwd(), "public/fonts/NotoSansSC-Regular.otf"),
});

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, lineHeight: 1.6 },
  pageZh: { fontFamily: "Noto Sans SC" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 16 },
  body: { marginBottom: 24, whiteSpace: "pre-wrap" },
  signatureBlock: { marginTop: 32, borderTop: 1, borderColor: "#cccccc", paddingTop: 16 },
  signatureImage: { width: 200, height: 80, objectFit: "contain" },
  meta: { marginTop: 8, fontSize: 9, color: "#555555" },
});

type ContractPdfProps = {
  title: string;
  clientName: string;
  body: string;
  signatureDataUrl: string;
  signedAtLabel: string;
  ipAddress: string;
  locale: "fr" | "zh";
};

function ContractDocument({
  title,
  clientName,
  body,
  signatureDataUrl,
  signedAtLabel,
  ipAddress,
  locale,
}: ContractPdfProps) {
  const pageStyle = locale === "zh" ? [styles.page, styles.pageZh] : styles.page;

  return (
    <Document>
      <Page size="A4" style={pageStyle}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        <View style={styles.signatureBlock}>
          <Text>{clientName}</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not an HTML img */}
          <Image src={signatureDataUrl} style={styles.signatureImage} />
          <Text style={styles.meta}>{signedAtLabel}</Text>
          <Text style={styles.meta}>{ipAddress}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderContractPdf(props: ContractPdfProps): Promise<Buffer> {
  return renderToBuffer(<ContractDocument {...props} />);
}
