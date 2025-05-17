import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { id: "hotels", img: "/backgrounds/hotel.jpeg", label: "Hotels", text: "Find the best hotel recommendations." },
  { id: "tourist", img: "/backgrounds/touristplaces.jpg", label: "Tourist Spots", text: "Discover must-visit places." },
  { id: "activities", img: "/backgrounds/activities.jpeg", label: "Activities", text: "Enjoy fun and adventurous activities." },
];

const locations = [
  { img: "/backgrounds/purulia.jpg", label: "PURULIA" },
  { img: "/backgrounds/darjeeling.jpeg", label: "DARJEELING" },
  { img: "/backgrounds/digha.jpeg", label: "DIGHA" },
];

function Hero() {
  const [active, setActive] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const handleClick = (id) => setActive(active === id ? null : id);
  const toggleFlip = () => setFlipped(!flipped);

  return (
    <>
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("/backgrounds/B.jpeg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          padding: "4rem 2rem",
          minHeight: "100vh",
          fontFamily: "'EB Garamond', serif",
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          {/* Welcome Section */}
          <div style={{ flex: "1 1 60%", marginTop: "7rem", textAlign: "center" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "4.5rem", fontWeight: "800", margin: 0, color: "#FFD700", textShadow: "2px 2px 10px rgba(0,0,0,0.7)" }}>
              Welcome To <br /> PotherPanchali.AI !
            </h1>
            <p style={{ marginTop: "1.2rem", fontFamily: "'EB Garamond', serif", fontSize: "1.25rem", fontWeight: "600", lineHeight: 1.9, maxWidth: "700px", marginInline: "auto", textShadow: "1px 1px 5px rgba(0,0,0,0.6)", color: "#f8f8f8" }}>
              Like <em>Apu’s</em> journey in <em>Pother Panchali</em>, discover the rich tapestry of local cultures and traditions.
            </p>
            <div style={{ marginTop: "2rem" }}>
              <Link to="/create_trips">
                <button style={{ backgroundColor: "#B8860B", color: "#fff", border: "none", padding: "0.8rem 2rem", borderRadius: "10px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.3)", fontFamily: "'Cinzel', serif" }}>
                  BEGIN
                </button>
              </Link>
            </div>
          </div>

          {/* About Us Flip Card */}
          <motion.div
            style={{
              perspective: 1000,
              marginTop: "6rem",
              width: "300px",
              height: "380px",
            }}
            onClick={toggleFlip}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                transformStyle: "preserve-3d",
                cursor: "pointer",
              }}
            >
              {/* Front Face */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "18px",
                  overflow: "hidden",
                  backdropFilter: "blur(5px)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                  alignSelf: "flex-start",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ position: "relative", width: "100%", flexGrow: 1 }}>
                  <img
                    src="/backgrounds/aboutus.jpeg"
                    alt="About Us"
                    style={{
                      width: "80%",
                      margin: "0 auto",
                      height: "auto",
                      display: "block",
                      opacity: 0.9,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "5%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      color: "#6B4A2D",
                      fontWeight: "900",
                      textAlign: "center",
                      fontFamily: "'Cinzel', serif",
                      fontSize: "1.4rem",
                      letterSpacing: "1.5px",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                    }}
                  >
                    ABOUT US
                  </div>
                </div>
              </div>

              {/* Back Face */}
              <div
                style={{
                  backfaceVisibility: "hidden",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  backgroundColor: "rgba(107, 74, 45, 0.85)",
                  borderRadius: "18px",
                  padding: "0.8rem 1rem",
                  transform: "rotateY(180deg)",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    color: "#f0f0f0",
                    fontFamily: "'EB Garamond', serif",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    lineHeight: 1.5,
                    textShadow: "1px 1px 4px rgba(0,0,0,0.6)",
                  }}
                >
                  Your AI-powered travel planner, crafting personalized journeys and guiding you through diverse paths of exploration.
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories & Destinations Section */}
      <section
        style={{
          backgroundImage: 'url("/backgrounds/C.jpeg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "4rem 2rem",
          fontFamily: "'EB Garamond', serif",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
            color: "white",
          }}
        >
          {/* Categories */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "5rem",
              flexWrap: "wrap",
              marginBottom: "3rem",
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleClick(cat.id)}
                style={{
                  width: "280px",
                  position: "relative",
                  cursor: "pointer",
                  transition: "transform 0.3s",
                  transform: active === cat.id ? "translateY(-10px)" : "none",
                }}
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    opacity: 0.85,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                />
                <p
                  style={{
                    marginTop: "0.5rem",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    backgroundColor: "rgba(107, 74, 45, 0.75)",
                    padding: "0.3rem",
                    borderRadius: "6px",
                    color: "#fff",
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  {cat.label}
                </p>
                {active === cat.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: "1rem",
                      padding: "1rem",
                      textAlign: "center",
                      backgroundColor: "rgba(107, 74, 45, 0.7)",
                      borderRadius: "10px",
                    }}
                  >
                    {cat.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Destinations */}
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              marginBottom: "2rem",
              display: "inline-block",
              padding: "0.6rem 1.8rem",
              borderRadius: "8px",
              backgroundColor: "#6B4A2D",
              color: "#fff",
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              fontFamily: "'Cinzel', serif",
            }}
          >
            POPULAR DESTINATIONS
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "5rem",
              flexWrap: "wrap",
            }}
          >
            {locations.map((loc) => (
              <div
                key={loc.label}
                style={{
                  width: "280px",
                  textAlign: "center",
                  transition: "transform 0.3s",
                  fontFamily: "'EB Garamond', serif",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.03)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <img
                  src={loc.img}
                  alt={loc.label}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    opacity: 0.85,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                />
                <p
                  style={{
                    marginTop: "0.5rem",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    backgroundColor: "rgba(107, 74, 45, 0.75)",
                    color: "#fff",
                    padding: "0.3rem",
                    borderRadius: "6px",
                    fontFamily: "'Cinzel', serif",
                  }}
                >
                  {loc.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;

