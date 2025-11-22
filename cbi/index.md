# Eclipse Common Build Infrastructure 

The [Eclipse Common Build Infrastructure](https://projects.eclipse.org/projects/technology.cbi) project, `CBI`, 
provides infrastructure, services, technologies, and best practices for building, testing, and delivering software at the Eclipse Foundation.
It hosts several key technologies that are integral to producing the simultaneous release.

## p2 SBOM Generator

The [p2 SBOM Generator](https://github.com/eclipse-cbi/p2repo-sbom/blob/main/docs/index.md)
generates a high-quality Software Bill Of Materials, i.e., an `SBOM`.
For SimRel, such an SBOM is uploaded to [sbom.eclipse.org](https://sbom.eclipse.org/) for analysis.

## p2 Aggregator 

The [p2 Aggregator](https://github.com/eclipse-cbi/p2repo-aggregator/blob/main/docs/user-guide.md)
aggregates contributed content from multiple sources into a single p2 repository.
It is used by the [simrel.build](https://ci.eclipse.org/simrel/job/simrel.build/) job.

## p2 Analyzers 

The [p2 Analyzers](https://github.com/eclipse-cbi/p2repo-analyzers/blob/main/README.md)
generate the reports produced by the [simrel.reporeports.pipeline](https://ci.eclipse.org/simrel/job/simrel.reporeports.pipeline/) job.

