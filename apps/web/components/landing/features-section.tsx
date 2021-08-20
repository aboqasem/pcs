import { HiCode, HiServer, HiShieldCheck } from 'react-icons/hi';

/* eslint-disable-next-line */
export interface FeaturesSectionProps {}

const features = [
  { name: 'Built-in Code Editor', icon: HiCode },
  { name: 'Reliable Storage', icon: HiServer },
  { name: 'Advanced Security', icon: HiShieldCheck },
];

export default function FeaturesSection(props: FeaturesSectionProps) {
  return (
    <section id="features" className="relative py-16 bg-white sm:py-24 lg:py-32">
      <div className="max-w-md px-4 mx-auto text-center sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl">
        <h2 className="text-base font-semibold tracking-wider text-blue-600 uppercase">
          Create faster
        </h2>
        <p className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Everything you need to create your materials
        </p>
        <p className="mx-auto mt-5 text-xl text-gray-500 max-w-prose">
          Phasellus lorem quam molestie id quisque diam aenean nulla in. Accumsan in quis quis nunc,
          ullamcorper malesuada. Eleifend condimentum id viverra nulla.
        </p>
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root px-6 pb-8 rounded-lg bg-gray-50">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                        <feature.icon className="w-6 h-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. Et magna sit
                      morbi lobortis.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
