export interface Partner {
  id: number;
  name: string;
  logoUrl: string;
  type: "sponsor" | "media_partner";
}

export const fallbackSponsors: Partner[] = [
  { id: 1, name: "Sewa Kamera", logoUrl: "/logos/sponsors/sewa_kamera.svg", type: "sponsor" },
  { id: 2, name: "Risa Florist & Co.", logoUrl: "/logos/sponsors/risa_florist.svg", type: "sponsor" },
  { id: 3, name: "Syneps Academy", logoUrl: "/logos/sponsors/syneps.svg", type: "sponsor" },
  { id: 4, name: "Cibubur IT Center", logoUrl: "/logos/sponsors/cibubur_it.svg", type: "sponsor" },
  { id: 5, name: "Bank BRI", logoUrl: "/logos/sponsors/bri.svg", type: "sponsor" },
  { id: 6, name: "Miss Bakers", logoUrl: "/logos/sponsors/miss_bakers.svg", type: "sponsor" },
  { id: 7, name: "PUSRI", logoUrl: "/logos/sponsors/pusri.svg", type: "sponsor" },
];

export const fallbackMediaPartners: Partner[] = [
  { id: 101, name: "HIMA IF", logoUrl: "/logos/media_partners/hima_if.svg", type: "media_partner" },
  { id: 102, name: "HMI", logoUrl: "/logos/media_partners/hmi.svg", type: "media_partner" },
  { id: 103, name: "CMS", logoUrl: "/logos/media_partners/cms.svg", type: "media_partner" },
  { id: 104, name: "HMJ AOK", logoUrl: "/logos/media_partners/hmj_aok.svg", type: "media_partner" },
  { id: 105, name: "BNCC", logoUrl: "/logos/media_partners/bncc.svg", type: "media_partner" },
  { id: 106, name: "HIMA ILKOM FMIPA UNNES", logoUrl: "/logos/media_partners/hima_ilkom.svg", type: "media_partner" },
];
