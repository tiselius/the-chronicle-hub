import Layout from "@/components/layout/Layout";

const About = () => {
  return (
    <Layout>
      <section className="container-editorial py-16">
        <header className="mb-16">
          <h1 className="text-5xl md:text-6xl font-serif mb-4">
          Om sajten
          </h1>
        </header>

        <div className="prose max-w-none">
          <p>
          Sida om böcker och försäljning av böcker.
          </p>

          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="font-sans text-sm uppercase tracking-wide text-muted-foreground mb-4">
              Hör av dig
            </h3>
            <p className="font-sans">
              For inquiries, please reach out at{" "}
              <a href="mailto:hello@editorial.com" className="underline">
                hello@editorial.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
