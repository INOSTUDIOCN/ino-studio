import path from "node:path";
import { Document, Page, Text, View, Image, Font, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { JSONContent } from "@/lib/contract-content";

Font.register({
  family: "Noto Sans SC",
  src: path.join(process.cwd(), "public/fonts/NotoSansSC-Regular.otf"),
});

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, lineHeight: 1.6 },
  pageZh: { fontFamily: "Noto Sans SC" },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 16 },
  heading: { fontSize: 13, fontWeight: 700, marginTop: 14, marginBottom: 4 },
  paragraph: { marginTop: 4 },
  bold: { fontWeight: 700 },
  listItem: { marginTop: 2, marginLeft: 12 },
  taskItem: { marginTop: 4, flexDirection: "row" },
  taskMark: { width: 16 },
  signatureBlock: { marginTop: 32, borderTop: 1, borderColor: "#cccccc", paddingTop: 16 },
  signatureImage: { width: 200, height: 80, objectFit: "contain" },
  meta: { marginTop: 8, fontSize: 9, color: "#555555" },
});

function textFrom(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(textFrom).join("");
}

function renderInline(nodes: JSONContent[] | undefined) {
  return (nodes ?? []).map((node, i) =>
    node.type === "text" ? (
      <Text key={i} style={node.marks?.some((m) => m.type === "bold") ? styles.bold : undefined}>
        {node.text}
      </Text>
    ) : null
  );
}

function renderNodes(nodes: JSONContent[] | undefined, checkedLabels?: Set<string>) {
  return (nodes ?? []).map((node, i) => {
    switch (node.type) {
      case "heading":
        return (
          <Text key={i} style={styles.heading}>
            {renderInline(node.content)}
          </Text>
        );
      case "paragraph":
        return (
          <Text key={i} style={styles.paragraph}>
            {renderInline(node.content)}
          </Text>
        );
      case "bulletList":
        return (node.content ?? []).map((item, j) => (
          <Text key={`${i}-${j}`} style={styles.listItem}>
            • {(item.content ?? []).map((p) => textFrom(p)).join(" ")}
          </Text>
        ));
      case "taskList":
        return (node.content ?? []).map((item, j) => {
          const label = textFrom(item);
          const checked = checkedLabels ? checkedLabels.has(label) : Boolean(item.attrs?.checked);
          return (
            <View key={`${i}-${j}`} style={styles.taskItem}>
              <Text style={styles.taskMark}>{checked ? "☑" : "☐"}</Text>
              <Text>{label}</Text>
            </View>
          );
        });
      default:
        return null;
    }
  });
}

type ContractPdfProps = {
  title: string;
  content: JSONContent;
  checkedLabels?: string[];
  locale: "fr" | "zh";
  signature?: {
    clientName: string;
    signatureDataUrl: string;
    signedAtLabel: string;
    ipAddress: string;
  };
};

function ContractDocument({ title, content, checkedLabels, locale, signature }: ContractPdfProps) {
  const pageStyle = locale === "zh" ? [styles.page, styles.pageZh] : styles.page;
  const checkedSet = checkedLabels ? new Set(checkedLabels) : undefined;

  return (
    <Document>
      <Page size="A4" style={pageStyle}>
        <Text style={styles.title}>{title}</Text>
        {renderNodes(content.content, checkedSet)}

        {signature && (
          <View style={styles.signatureBlock}>
            <Text>{signature.clientName}</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image, not an HTML img */}
            <Image src={signature.signatureDataUrl} style={styles.signatureImage} />
            <Text style={styles.meta}>{signature.signedAtLabel}</Text>
            <Text style={styles.meta}>{signature.ipAddress}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export async function renderContractPdf(props: ContractPdfProps): Promise<Buffer> {
  return renderToBuffer(<ContractDocument {...props} />);
}
