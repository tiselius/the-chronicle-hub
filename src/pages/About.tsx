import Layout from "@/components/layout/Layout";

const About = () => {
  return (
    <Layout>
      <section className="container-editorial py-16">
        <header className="mb-16">
          <h1 className="text-5xl md:text-6xl font-serif mb-4">About</h1>
        </header>

        <div className="prose max-w-none">
          <p>
            Editorial is a space for thoughtful exploration of design, craft, and the 
            things that make everyday life a little more beautiful. We believe in the 
            power of simplicity and the importance of intentional choices.
          </p>

          <p>
            Our articles delve into the intersection of creativity and purpose, while 
            our store offers a curated selection of objects that embody these principles. 
            Each piece we feature is chosen for its quality, craftsmanship, and the 
            story it tells.
          </p>

          <p>
            Founded with a commitment to substance over spectacle, we aim to create 
            a calm corner of the internet where ideas and objects are presented with 
            the care they deserve.
          </p>

          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="font-sans text-sm uppercase tracking-wide text-muted-foreground mb-4">
              Get in Touch
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
