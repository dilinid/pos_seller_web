import type { FC } from "react";
import type { DashboardSocialLink } from "./dashboard.types";
import type { SocialMediaLink } from "../../types/credit-union.type";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { Globe } from "lucide-react";

interface DashboardHeaderProps {
  bankName: string;
  bankAddress: string;
  bankHotline: string;
  logoUrl: string;
  showLogo: boolean;
  onLogoError: () => void;
  userName?: string;
  profilePicture?: string;
  memberCode?: string;
  creditScore: number;
  creditScoreBand: string;
  socialMediaLinks?: SocialMediaLink;
}

const socials: DashboardSocialLink[] = [
  {
    label: "Facebook",
    value: "facebookUrl",
    href: "https://www.facebook.com/",
    icon: <FaFacebook size={14} />,
  },
  {
    label: "YouTube",
    value: "youtubeUrl",
    href: "https://www.youtube.com/",
    icon: <FaYoutube size={14} />,
  },
  {
    label: "Instagram",
    value: "instagramUrl",
    href: "https://www.instagram.com/",
    icon: <FaInstagram size={14} />,
  },
  { label: "Web", value: "webSiteUrl", href: "#", icon: <Globe size={14} /> },
];

const DashboardHeader: FC<DashboardHeaderProps> = ({
  bankName,
  bankAddress,
  bankHotline,
  logoUrl,
  showLogo,
  onLogoError,
  userName,
  profilePicture,
  memberCode,
  creditScore,
  creditScoreBand,
  socialMediaLinks,
}) => {
  const dialableHotline = bankHotline.replace(/\s+/g, "");
  return (
    <div
      className="premium-card"
      style={{
        background: "#ffffff",
        padding: "22px 24px",
        borderRadius: "var(--border-radius-md)",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--card-shadow)",
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <section
          style={{
            paddingBottom: "18px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: "1 1 460px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: logoUrl ? "#ffffff" : "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.95rem",
                    flexShrink: 0,
                  }}
                >
                  {showLogo && logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`${bankName} logo`}
                      onError={onLogoError}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  ) : (
                    <span aria-hidden="true">🏦</span>
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <h1
                    style={{
                      fontSize: "1.5rem",
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      margin: 0,
                      color: "var(--text-primary)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {bankName}
                  </h1>
                  <p
                    style={{
                      margin: "6px 0 0 0",
                      fontSize: "0.84rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.45,
                    }}
                  >
                    {bankAddress}
                  </p>
                  <a
                    href={`tel:${dialableHotline}`}
                    style={{
                      display: "inline-flex",
                      marginTop: "6px",
                      fontSize: "0.84rem",
                      fontWeight: 700,
                      color: "var(--primary)",
                      textDecoration: "none",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {bankHotline}
                  </a>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "8px",
                marginLeft: "auto",
                flex: "0 0 auto",
                flexWrap: "wrap",
                paddingTop: "2px",
              }}
            >
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={socialMediaLinks?.[social.value] || social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${bankName} ${social.label}`}
                  title={social.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "1px solid var(--border-color)",
                    background: "#ffffff",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    transition: "var(--transition-fast)",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
              paddingTop: "2px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                minWidth: 0,
                flex: "1 1 360px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "var(--primary-light)",
                  border: "1px solid var(--primary-glow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {profilePicture ? (
                  <img
                    src={`data:image/jpeg;base64,${profilePicture}`}
                    alt="profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  userName?.charAt(0) || "U"
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    color: "var(--text-secondary)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "4px",
                  }}
                >
                  Welcome back
                </span>
                <h2
                  style={{
                    fontSize: "1.16rem",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    margin: "0 0 4px 0",
                    color: "var(--text-primary)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {userName}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.83rem",
                    color: "var(--text-secondary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Member ID</span>{" "}
                  <span
                    style={{ fontWeight: 700, color: "var(--text-primary)" }}
                  >
                    {memberCode}
                  </span>
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right", minWidth: "160px" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "0.68rem",
                  color: "var(--text-secondary)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                Credit score
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    fontSize: "1.9rem",
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    color: "var(--primary)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {creditScore}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    background: "var(--primary-light)",
                    borderRadius: "999px",
                    padding: "3px 8px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {creditScoreBand}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardHeader;
