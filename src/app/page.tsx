"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import Link from 'next/link';

// Import your images
import Image1 from '../../public/images/1.png';
import Image2 from '../../public/images/2.png';
import Image3 from '../../public/images/3.png';
import Image4 from '../../public/images/4.png';
import Image5 from '../../public/images/5.png';
import Image6 from '../../public/images/6.png';
import Image7 from '../../public/images/7.png';
import Image8 from '../../public/images/8.png';
import Image9 from '../../public/images/9.png';
import Logo from '../../public/images/logo.png';
import Bg from '../../public/images/BG.png';

export default function Home() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLElement | null>(null);
  const whyChooseRef = useRef<HTMLElement | null>(null);
  const svgContainerRef = useRef<SVGSVGElement | null>(null);
  const floatingShapesRef = useRef<SVGSVGElement | null>(null);
  const networkNodesRef = useRef<SVGSVGElement | null>(null);
  const pulseWavesRef = useRef<SVGSVGElement | null>(null);
  const morphShapesRef = useRef<SVGSVGElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Scroll event for navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    // Custom cursor
    const cursor = cursorRef.current;
    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX - 16,
        y: e.clientY - 16,
        duration: 0.1,
        ease: "power2.out"
      });
    };

    // Cursor hover effects
    const handleMouseEnter = () => {
      gsap.to(cursor, { scale: 1.5, duration: 0.2 });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    };

    // Add event listeners for buttons and interactive elements
    const buttons = document.querySelectorAll('button, a, .interactive');
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', handleMouseEnter);
      btn.addEventListener('mouseleave', handleMouseLeave);
    });

    document.addEventListener('mousemove', moveCursor);

    // GSAP Animations
    const tl = gsap.timeline();

    // Hero section animation
    tl.fromTo(heroRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    // Features section animation
    gsap.fromTo(".feature-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Why choose us animation
    gsap.fromTo(".why-choose-item",
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        stagger: 0.3,
        scrollTrigger: {
          trigger: whyChooseRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Crazy SVG Animations
    if (svgContainerRef.current) {
      // Floating particles animation
      const particles = svgContainerRef.current.querySelectorAll('.particle');
      particles.forEach((particle, i) => {
        gsap.to(particle, {
          x: () => gsap.utils.random(-100, 100),
          y: () => gsap.utils.random(-100, 100),
          rotation: () => gsap.utils.random(-180, 180),
          duration: () => gsap.utils.random(3, 6),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2
        });
      });

      // Pulsing circles
      const circles = svgContainerRef.current.querySelectorAll('.pulse-circle');
      circles.forEach((circle, i) => {
        gsap.to(circle, {
          scale: 0,
          opacity: 0,
          duration: 2,
          repeat: -1,
          ease: "power2.out",
          delay: i * 0.5
        });
      });
    }

    // Floating shapes animation
    if (floatingShapesRef.current) {
      const shapes = floatingShapesRef.current.querySelectorAll('.floating-shape');
      shapes.forEach((shape, i) => {
        gsap.to(shape, {
          y: () => gsap.utils.random(-50, 50),
          x: () => gsap.utils.random(-30, 30),
          rotation: () => gsap.utils.random(-45, 45),
          duration: () => gsap.utils.random(2, 4),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.3
        });
      });
    }

    // Network nodes animation
    if (networkNodesRef.current) {
      const nodes = networkNodesRef.current.querySelectorAll('.network-node');
      const connections = networkNodesRef.current.querySelectorAll('.network-connection');
      
      nodes.forEach((node, i) => {
        gsap.to(node, {
          scale: () => gsap.utils.random(0.8, 1.2),
          duration: () => gsap.utils.random(1, 2),
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: i * 0.1
        });
      });

      connections.forEach((connection, i) => {
        gsap.to(connection, {
          strokeDashoffset: -100,
          duration: 2,
          repeat: -1,
          ease: "none",
          delay: i * 0.2
        });
      });
    }

    // Pulse waves animation
    if (pulseWavesRef.current) {
      const waves = pulseWavesRef.current.querySelectorAll('.pulse-wave');
      waves.forEach((wave, i) => {
        gsap.to(wave, {
          scale: 3,
          opacity: 0,
          duration: 3,
          repeat: -1,
          ease: "power2.out",
          delay: i * 1
        });
      });
    }

    // Morphing shapes animation
    if (morphShapesRef.current) {
      const morphs = morphShapesRef.current.querySelectorAll('.morph-shape');
      morphs.forEach((morph, i) => {
        const shapes = [
          "M50,25 C60,10 80,10 90,25 C100,40 100,60 90,75 C80,90 60,90 50,75 C40,60 40,40 50,25",
          "M50,20 C70,5 85,15 80,40 C75,65 60,80 40,70 C20,60 25,35 50,20",
          "M30,30 C45,20 65,20 80,30 C95,40 95,60 80,70 C65,80 45,80 30,70 C15,60 15,40 30,30",
          "M40,25 C55,15 70,25 75,40 C80,55 70,70 55,75 C40,80 25,70 20,55 C15,40 25,25 40,25"
        ];
        
        gsap.to(morph, {
          morphSVG: shapes[(i + 1) % shapes.length],
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5
        });
      });
    }

    // Floating animation for feature cards
    gsap.to(".feature-card", {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      stagger: 0.2
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', moveCursor);
      buttons.forEach(btn => {
        btn.removeEventListener('mouseenter', handleMouseEnter);
        btn.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white font-sans overflow-hidden">
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 border-2 border-blue-500 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
      />

      {/* Crazy SVG Background Animations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Main SVG Container */}
        <svg
          ref={svgContainerRef}
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
        >
          {/* Floating Particles */}
          {Array.from({ length: 25 }).map((_, i) => (
            <circle
              key={i}
              className="particle"
              cx={Math.random() * 100}
              cy={Math.random() * 100}
              r={Math.random() * 1.5 + 0.5}
              fill={`hsl(${Math.random() * 360}, 70%, 60%)`}
              opacity={0.4}
            />
          ))}

          {/* Pulsing Circles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={i}
              className="pulse-circle"
              cx={10 + i * 12}
              cy={85}
              r={2}
              fill="none"
              stroke={`hsl(${210 + i * 45}, 70%, 60%)`}
              strokeWidth="0.5"
            />
          ))}

          {/* Geometric Patterns */}
          <path
            d="M10,10 L20,5 L30,10 L25,20 L15,20 Z"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.3"
            opacity="0.3"
          />
          <path
            d="M85,15 L90,25 L85,35 L75,35 L70,25 Z"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="0.3"
            opacity="0.3"
          />
        </svg>

        {/* Floating Shapes Container */}
        <svg
          ref={floatingShapesRef}
          className="absolute top-1/4 left-1/4 w-1/2 h-1/2"
          viewBox="0 0 100 100"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i} className="floating-shape">
              {i % 4 === 0 && (
                <circle
                  cx={15 + (i * 8)}
                  cy={25}
                  r={6}
                  fill="none"
                  stroke={`hsl(${i * 30}, 70%, 60%)`}
                  strokeWidth="1.2"
                  opacity="0.4"
                />
              )}
              {i % 4 === 1 && (
                <rect
                  x={12 + (i * 10)}
                  y={20}
                  width={8}
                  height={8}
                  fill="none"
                  stroke={`hsl(${i * 30 + 90}, 70%, 60%)`}
                  strokeWidth="1.2"
                  opacity="0.4"
                />
              )}
              {i % 4 === 2 && (
                <polygon
                  points={`${20 + (i * 7)},15 ${25 + (i * 7)},30 ${15 + (i * 7)},30`}
                  fill="none"
                  stroke={`hsl(${i * 30 + 180}, 70%, 60%)`}
                  strokeWidth="1.2"
                  opacity="0.4"
                />
              )}
              {i % 4 === 3 && (
                <path
                  d={`M${18 + (i * 9)},22 L${22 + (i * 9)},18 L${26 + (i * 9)},22 L${22 + (i * 9)},26 Z`}
                  fill="none"
                  stroke={`hsl(${i * 30 + 270}, 70%, 60%)`}
                  strokeWidth="1.2"
                  opacity="0.4"
                />
              )}
            </g>
          ))}
        </svg>

        {/* Network Nodes Animation */}
        <svg
          ref={networkNodesRef}
          className="absolute bottom-32 right-32 w-80 h-80"
          viewBox="0 0 100 100"
        >
          {/* Network Connections */}
          <path
            className="network-connection"
            d="M20,20 L40,40 L60,30 L80,50"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="0.8"
            strokeDasharray="5,5"
            opacity="0.5"
          />
          <path
            className="network-connection"
            d="M30,70 L50,50 L70,60 L80,80"
            fill="none"
            stroke="#10B981"
            strokeWidth="0.8"
            strokeDasharray="5,5"
            opacity="0.5"
          />
          <path
            className="network-connection"
            d="M15,50 L35,35 L55,65 L75,45"
            fill="none"
            stroke="#EC4899"
            strokeWidth="0.8"
            strokeDasharray="5,5"
            opacity="0.5"
          />

          {/* Network Nodes */}
          {[
            { x: 20, y: 20, color: '#3B82F6' },
            { x: 40, y: 40, color: '#8B5CF6' },
            { x: 60, y: 30, color: '#EC4899' },
            { x: 80, y: 50, color: '#10B981' },
            { x: 30, y: 70, color: '#F59E0B' },
            { x: 50, y: 50, color: '#EF4444' },
            { x: 70, y: 60, color: '#06B6D4' },
            { x: 80, y: 80, color: '#84CC16' },
            { x: 15, y: 50, color: '#8B5CF6' },
            { x: 35, y: 35, color: '#EC4899' },
            { x: 55, y: 65, color: '#10B981' },
            { x: 75, y: 45, color: '#F59E0B' }
          ].map((node, i) => (
            <circle
              key={i}
              className="network-node"
              cx={node.x}
              cy={node.y}
              r={2.5}
              fill={node.color}
              opacity="0.7"
            />
          ))}
        </svg>

        {/* Pulse Waves */}
        <svg
          ref={pulseWavesRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40"
          viewBox="0 0 100 100"
        >
          <circle
            className="pulse-wave"
            cx="50"
            cy="50"
            r="8"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="1.5"
          />
          <circle
            className="pulse-wave"
            cx="50"
            cy="50"
            r="8"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="1.5"
          />
          <circle
            className="pulse-wave"
            cx="50"
            cy="50"
            r="8"
            fill="none"
            stroke="#EC4899"
            strokeWidth="1.5"
          />
        </svg>

        {/* Morphing Shapes */}
        <svg
          ref={morphShapesRef}
          className="absolute bottom-40 left-40 w-56 h-56"
          viewBox="0 0 100 100"
        >
          <path
            className="morph-shape"
            d="M50,25 C60,10 80,10 90,25 C100,40 100,60 90,75 C80,90 60,90 50,75 C40,60 40,40 50,25"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <path
            className="morph-shape"
            d="M30,40 C45,30 55,30 70,40 C85,50 85,65 70,75 C55,85 45,85 30,75 C15,65 15,50 30,40"
            fill="none"
            stroke="#10B981"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <path
            className="morph-shape"
            d="M35,20 C50,10 65,15 70,30 C75,45 65,60 50,65 C35,70 20,60 15,45 C10,30 20,20 35,20"
            fill="none"
            stroke="#EF4444"
            strokeWidth="1.5"
            opacity="0.5"
          />
        </svg>

        {/* Animated Lines Grid */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={i}
              x1={0}
              y1={i * 5}
              x2={100}
              y2={i * 5}
              stroke="#3B82F6"
              strokeWidth="0.2"
            />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={i}
              x1={i * 5}
              y1={0}
              x2={i * 5}
              y2={100}
              stroke="#8B5CF6"
              strokeWidth="0.2"
            />
          ))}
        </svg>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Image src={Logo} alt="Logo" width={100} height={100} />
            </motion.div>

            {/* Sign In Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link href="/signin">
                <Button className="bg-blue-600 text-white hover:bg-blue-700 interactive px-6">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 text-center relative min-h-screen flex items-center justify-center">
        <div
          ref={heroRef}
          className="max-w-6xl mx-auto px-4 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              APTUS Pro
            </motion.h1>
            <motion.p 
              className="text-2xl md:text-3xl text-gray-600 mb-8 leading-relaxed max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Revolutionizing School Management with AI-Powered Solutions for the Modern Educational Landscape
            </motion.p>
            <motion.p
              className="text-lg md:text-xl text-gray-500 mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Streamline academic operations, enhance student engagement, and empower educators with our comprehensive platform designed for excellence in education.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/signin" className="w-full sm:w-auto">
                <Button className="p-6 text-xl rounded-3xl bg-blue-600 hover:bg-blue-700 text-white w-full interactive">
                  Get Started Free
                </Button>
              </Link>
              <Button variant="outline" className="p-6 text-xl rounded-3xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white w-full sm:w-auto interactive">
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <Image
          src={Bg}
          alt="Background"
          fill
          className="absolute top-0 left-0 w-full h-full object-cover opacity-10 pointer-events-none"
        />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Schools Trust Us" },
              { number: "50K+", label: "Active Students" },
              { number: "5K+", label: "Educators" },
              { number: "99.9%", label: "Uptime Reliability" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6"
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-3">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-lg">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-800 text-center mb-4"
          >
            Comprehensive Features
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto"
          >
            Everything you need to manage your educational institution efficiently
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Secure Sign-in Portal",
                description: "Multi-factor authentication and role-based access for students, teachers, and administrators.",
                color: "blue",
                image: Image1,
                buttonText: "Access Portal"
              },
              {
                title: "Admin Dashboard",
                description: "Real-time analytics and comprehensive oversight of all school operations and performance metrics.",
                color: "green",
                image: Image2,
                buttonText: "Explore Dashboard"
              },
              {
                title: "Teacher Management",
                description: "Complete teacher profiles, schedule management, and performance tracking systems.",
                color: "purple",
                image: Image3,
                buttonText: "Manage Faculty"
              },
              {
                title: "Student Profiles",
                description: "Detailed academic records, attendance tracking, and behavioral monitoring in one place.",
                color: "yellow",
                image: Image4,
                buttonText: "View Students"
              },
              {
                title: "Results & Analytics",
                description: "Advanced grade tracking, performance analytics, and automated report generation.",
                color: "red",
                image: Image5,
                buttonText: "Track Performance"
              },
              {
                title: "Payment Systems",
                description: "Secure fee collection, financial reporting, and scholarship management tools.",
                color: "indigo",
                image: Image6,
                buttonText: "Manage Finances"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="feature-card interactive"
              >
                <Card className="bg-white hover:shadow-2xl transition-all duration-300 border border-gray-200 h-full flex flex-col group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-xl group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-gray-600 mb-4 text-base">
                      {feature.description}
                    </CardDescription>
                    <Link href="/signin" className="w-full">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white interactive">
                        {feature.buttonText}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-800 text-center mb-12"
          >
            What Schools Are Saying
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "This platform reduced our administrative workload by 60% and improved parent engagement significantly.",
                author: "Sarah Chen",
                role: "Principal, Greenfield Academy",
                school: "Greenfield Academy"
              },
              {
                quote: "The analytics and reporting features have transformed how we track student progress and make data-driven decisions.",
                author: "Michael Rodriguez",
                role: "IT Director",
                school: "Lincoln High School"
              },
              {
                quote: "Implementation was seamless, and the support team is exceptional. Our teachers love the intuitive interface.",
                author: "Dr. Emily Watson",
                role: "Superintendent",
                school: "Maplewood District"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl text-blue-600 mb-4">&quot;</div>
                <p className="text-gray-600 text-lg mb-6 italic">
                  {testimonial.quote}
                </p>
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.author}</div>
                  <div className="text-gray-500">{testimonial.role}</div>
                  <div className="text-blue-600 font-medium">{testimonial.school}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-16 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-800 text-center mb-4"
          >
            Platform Overview
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto"
          >
            Experience our intuitive and powerful interface designed for modern education
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[Image7, Image8, Image9].map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="relative h-64 rounded-2xl overflow-hidden shadow-lg interactive group"
              >
                <Image
                  src={image}
                  alt={`Platform interface ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section ref={whyChooseRef} className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-800 text-center mb-4"
          >
            Why Choose APTUS Pro?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto"
          >
            Built by educators, for educators - delivering excellence in school management
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Intuitive Design",
                description: "User-friendly interface that requires minimal training. Designed with feedback from actual educators and administrators.",
                color: "blue",
                icon: "👨‍💻"
              },
              {
                title: "Enterprise Security",
                description: "Bank-level encryption, regular security audits, and compliance with educational data protection standards.",
                color: "green",
                icon: "🔒"
              },
              {
                title: "Scalable Solution",
                description: "Grows with your institution - from small private schools to large district-wide implementations.",
                color: "purple",
                icon: "📈"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="why-choose-item interactive text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                whileHover={{ y: -10 }}
              >
                <div className="text-5xl mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#263c34] to-[#3e3e3e] text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of educational institutions already using our platform to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signin" className="w-full sm:w-auto">
              <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg rounded-full interactive w-full">
                Start Free Trial
              </Button>
            </Link>
            <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg rounded-full interactive w-full sm:w-auto">
              Schedule Demo
            </Button>
          </div>
          <p className="mt-6 text-blue-200">
            No credit card required • 30-day free trial • Full access to all features
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Image src={Logo} alt="Logo" width={120} height={40} className="mb-4" />
              <p className="text-gray-400">
                Empowering educational institutions with innovative management solutions since 2020.
              </p>
            </motion.div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Case Studies", "Updates"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Blog", "Tutorials", "Support"]
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Contact", "Partners"]
              }
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
              >
                <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors interactive">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border-t border-gray-800 mt-8 pt-8 text-center"
          >
            <p className="text-gray-400">
              &copy; 2025 APTUS Pro. All rights reserved. | Built for the future of education
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}