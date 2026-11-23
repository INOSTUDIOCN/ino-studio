"use client";

import { useState } from "react";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { AdminSignaturePad } from "@/components/admin/AdminSignaturePad";

type Option = { value: string; label: string };

export function ContractTypeAndSignature({
  typeOptions,
  typePlaceholder,
  localeOptions,
  localePlaceholder,
  localeDefaultValue,
  signatureLabel,
  signatureClearLabel,
}: {
  typeOptions: Option[];
  typePlaceholder: string;
  localeOptions: Option[];
  localePlaceholder: string;
  localeDefaultValue?: string;
  signatureLabel: string;
  signatureClearLabel: string;
}) {
  const [type, setType] = useState("");

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <GlassSelect
          name="type"
          placeholder={typePlaceholder}
          required
          options={typeOptions}
          onChange={setType}
        />
        <GlassSelect
          name="contractLocale"
          placeholder={localePlaceholder}
          defaultValue={localeDefaultValue}
          options={localeOptions}
        />
      </div>

      {type === "signature" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">{signatureLabel}</p>
          <AdminSignaturePad name="adminSignature" clearLabel={signatureClearLabel} />
        </div>
      )}
    </>
  );
}
