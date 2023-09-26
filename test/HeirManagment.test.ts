import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";

describe("HeirManagement", function () {
  async function fixture() {
    const [owner, heir1, heir2, nonHeir] = await ethers.getSigners();

    const HeirManagement = await ethers.getContractFactory("HeirManagement");
    const heirManagement = await HeirManagement.connect(owner).deploy([heir1.address]);


    return {heirManagement, owner, heir1, heir2, nonHeir};
  }


  describe("Constructor", function () {
    it("should set the initial heirs correctly", async function () {
      const {heirManagement, nonHeir, owner, heir1, heir2,} = await loadFixture(fixture);
      const heirs = await heirManagement.getHeirs();
      expect(heirs).to.include(heir1.address);
      expect(heirs.length).to.equal(1);
    });
  });

  describe("setHeirs", function () {
    it("should update the list of heirs", async function () {
      const {heirManagement, nonHeir, owner, heir1, heir2,} = await loadFixture(fixture);

      await heirManagement.connect(owner).setHeirs([heir1.address, heir2.address]);

      const heirs = await heirManagement.getHeirs();
      expect(heirs).to.include(heir1.address);
      expect(heirs).to.include(heir2.address);
      expect(heirs.length).to.equal(2);
    });

    it("should emit an HeirsChanged event", async function () {
      const {heirManagement, nonHeir, owner, heir1, heir2,} = await loadFixture(fixture);

      await expect(heirManagement.connect(owner).setHeirs([heir1.address, heir2.address]))
        .to.emit(heirManagement, "HeirsChanged")
        .withArgs([heir1.address, heir2.address]);
    });
  });
});
