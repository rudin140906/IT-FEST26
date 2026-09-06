import { withBasePath } from "@/lib/site-path";

export interface Partner {
  id: number;
  name: string;
  logoUrl: string;
  type: "sponsor" | "media_partner";
  websiteUrl?: string;
  isVisible?: boolean;
  logoScale?: number;
  logoPositionX?: number;
  logoPositionY?: number;
}

export const fallbackSponsors: Partner[] = [
  { id: 1, name: "Sewa Kamera", logoUrl: withBasePath("/logos/sponsors/sewa_kamera.svg"), type: "sponsor", isVisible: true },
  { id: 2, name: "Risa Florist & Co.", logoUrl: withBasePath("/logos/sponsors/risa_florist.svg"), type: "sponsor", isVisible: true },
  { id: 3, name: "Syneps Academy", logoUrl: withBasePath("/logos/sponsors/syneps.svg"), type: "sponsor", isVisible: true },
  { id: 4, name: "Cibubur IT Center", logoUrl: withBasePath("/logos/sponsors/cibubur_it.svg"), type: "sponsor", isVisible: true },
  { id: 5, name: "Bank BRI", logoUrl: withBasePath("/logos/sponsors/bri.svg"), type: "sponsor", isVisible: true },
  { id: 6, name: "Miss Bakers", logoUrl: withBasePath("/logos/sponsors/miss_bakers.svg"), type: "sponsor", isVisible: true },
  { id: 7, name: "PUSRI", logoUrl: withBasePath("/logos/sponsors/pusri.svg"), type: "sponsor", isVisible: true },
];

export const fallbackMediaPartners: Partner[] = [
  { id: 101, name: "HIMA IF", logoUrl: withBasePath("/logos/media_partners/hima_if.svg"), type: "media_partner", isVisible: true },
  { id: 102, name: "HMI", logoUrl: withBasePath("/logos/media_partners/hmi.svg"), type: "media_partner", isVisible: true },
  { id: 103, name: "CMS", logoUrl: withBasePath("/logos/media_partners/cms.svg"), type: "media_partner", isVisible: true },
  { id: 104, name: "HMJ AOK", logoUrl: withBasePath("/logos/media_partners/hmj_aok.svg"), type: "media_partner", isVisible: true },
  { id: 105, name: "BNCC", logoUrl: withBasePath("/logos/media_partners/bncc.svg"), type: "media_partner", isVisible: true },
  { id: 106, name: "HIMA ILKOM FMIPA UNNES", logoUrl: withBasePath("/logos/media_partners/hima_ilkom.svg"), type: "media_partner", isVisible: true },
];
